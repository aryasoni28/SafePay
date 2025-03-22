from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import db, credentials
from flask_cors import CORS
import requests
import cohere
from dotenv import load_dotenv
import os

load_dotenv()
cohere_api_key = os.getenv("COHERE_API_KEY")
co = cohere.Client(api_key=cohere_api_key)

app = Flask(__name__)
CORS(app)

# Initialize Firebase Realtime Database
cred = credentials.Certificate("credentials.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://safepay-8470d-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

BANK_SERVERS = {
    "SBI": "http://localhost:5001",
    "HDFC": "http://localhost:5002"
}

@app.route('/create_account', methods=['POST'])
def create_account():
    data = request.json
    bank_name = data.get('bankName')

    if bank_name not in BANK_SERVERS:
        return jsonify({"message": "Invalid bank name"}), 400

    # Forward the request to the appropriate bank server
    response = requests.post(f"{BANK_SERVERS[bank_name]}/create_account", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    bank_name = data.get('bankName')
    phone_number = data.get('phoneNumber')

    if bank_name not in BANK_SERVERS:
        return jsonify({"message": "Invalid bank name"}), 400

    # Check with the bank server if the account exists
    response = requests.get(f"{BANK_SERVERS[bank_name]}/check_account/{phone_number}")
    if response.status_code != 200:
        return jsonify(response.json()), response.status_code

    # If account exists, create user in the 'users' collection
    ref = db.reference()
    users_ref = ref.child('users')
    new_user_ref = users_ref.child(phone_number)

    # Check if the user already exists
    if new_user_ref.get() is not None:
        return jsonify({"message": "User with this phone number already exists"}), 400

    # Set the user data
    new_user_ref.set({
        'name': data.get('name'),
        'phone_number': phone_number,
        'bank_name': bank_name,
        'password': data.get('password'),  # Note: In a real application, you should hash this password
        'reportCount': 0,  # Initialize reportCount to zero
    })

    return jsonify({"message": "User signed up successfully", "user_id": phone_number}), 200


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    phone_number = data.get('phoneNumber')
    password = data.get('password')

    if not phone_number or not password:
        return jsonify({"message": "Phone number and password are required"}), 400

    # Reference to the Firebase Realtime Database root
    ref = db.reference()

    # Check if the user exists in the 'users' collection
    user_ref = ref.child('users').child(phone_number)
    user_data = user_ref.get()

    if user_data is None:
        return jsonify({"message": "User not found"}), 404

    # Check if the password matches
    if user_data.get('password') != password:  # Note: In a real app, you'd compare hashed passwords
        return jsonify({"message": "Invalid password"}), 401

    # If we've reached here, login is successful
    return jsonify({
        "message": "Login successful",
        "user_id": phone_number,
        "name": user_data.get('name'),
        "bank_name": user_data.get('bank_name')
    }), 200


@app.route('/initiate_transaction', methods=['POST'])
def initiate_transaction():
    data = request.json
    sender_phone = data.get('sender_phone')
    recipient_phone = data.get('recipient_phone')

    if not sender_phone or not recipient_phone:
        return jsonify({
            "error": "missing_data",
            "message": f"Sender and recipient numbers are required. Received: sender={sender_phone}, recipient={recipient_phone}"
        }), 400

    ref = db.reference()
    users_ref = ref.child('users')

    # Get sender and recipient data
    sender_data = users_ref.child(sender_phone).get()
    recipient_data = users_ref.child(recipient_phone).get()

    if not sender_data or not recipient_data:
        return jsonify({"error": "not_found", "message": "Sender or recipient not found"}), 404

    # Send SYN packets to respective bank servers
    sender_bank = sender_data['bank_name']
    recipient_bank = recipient_data['bank_name']

    try:
        sender_syn = requests.post(f"{BANK_SERVERS[sender_bank]}/syn", json={"phone": sender_phone})
        recipient_syn = requests.post(f"{BANK_SERVERS[recipient_bank]}/syn", json={"phone": recipient_phone})

        if sender_syn.status_code != 200 or recipient_syn.status_code != 200:
            return jsonify({"error": "bank_error", "message": "Failed to send SYN packets to bank servers"}), 500

        # Check if report count is > 3
        report_count = recipient_data.get('reportCount', 0)
        if report_count > 3:
            reports = recipient_data.get('reports', [])
            # Filter out None values
            reports = [report for report in reports if report is not None]
            reports_text = " ".join(reports)
            
            try:
                if len(reports_text) < 250:
                    # Text is too short for summarization, use generate endpoint instead
                    response = co.generate(
                        model='command',
                        prompt=f"Summarize the following reports, focusing on the nature of the fraud and common patterns: {reports_text}",
                        max_tokens=100,
                        temperature=0.7,
                        k=0,
                        stop_sequences=[],
                        return_likelihoods='NONE'
                    )
                    summary = response.generations[0].text.strip()
                else:
                    # Use Cohere API to summarize the reports
                    response = co.summarize(
                        text=reports_text,
                        length='medium',
                        format='paragraph',
                        model='summarize-medium',
                        additional_command='Focus on the nature of the fraud and common patterns.'
                    )
                    summary = response.summary

                return jsonify({
                    "warning": "high_report_count",
                    "message": f"Warning: The recipient has {report_count} reports.",
                    "recipient_name": recipient_data.get('name'),
                    "recipient_bank": recipient_bank,
                    "report_summary": summary
                }), 200
            except cohere.CohereError as e:
                print(f"Error using Cohere API: {str(e)}")
                return jsonify({
                    "warning": "high_report_count",
                    "message": f"Warning: The recipient has {report_count} reports. Unable to summarize.",
                    "recipient_name": recipient_data.get('name'),
                    "recipient_bank": recipient_bank,
                    "reports": reports  # Return full reports instead of summary
                }), 200

        # If all conditions are met, set ready_to_transfer state
        return jsonify({"message": "Ready to transfer", "state": "ready_to_transfer"}), 200

    except requests.RequestException as e:
        print(f"Error communicating with bank servers: {str(e)}")
        return jsonify({"error": "bank_communication_error", "message": "Error communicating with bank servers"}), 500

@app.route('/process_payment', methods=['POST'])
def process_payment():
    data = request.json
    sender_phone = data.get('sender_phone')
    recipient_phone = data.get('recipient_phone')
    amount = data.get('amount')
    upi_pin = data.get('upi_pin')

    if not sender_phone or not recipient_phone or not amount or not upi_pin:
        return jsonify({"error": "missing_data", "message": "All fields are required"}), 400

    ref = db.reference()
    users_ref = ref.child('users')

    # Get sender and recipient data
    sender_data = users_ref.child(sender_phone).get()
    recipient_data = users_ref.child(recipient_phone).get()

    if not sender_data or not recipient_data:
        return jsonify({"error": "not_found", "message": "Sender or recipient not found"}), 404

    sender_bank = sender_data['bank_name']
    recipient_bank = recipient_data['bank_name']

    try:
        # Verify UPI PIN and debit amount from sender's account
        debit_response = requests.post(f"{BANK_SERVERS[sender_bank]}/debit", json={
            "phone": sender_phone,
            "amount": amount,
            "upi_pin": upi_pin
        })

        if debit_response.status_code != 200:
            return jsonify(debit_response.json()), debit_response.status_code

        # Credit amount to recipient's account
        credit_response = requests.post(f"{BANK_SERVERS[recipient_bank]}/credit", json={
            "phone": recipient_phone,
            "amount": amount
        })

        if credit_response.status_code != 200:
            # In case of failure to credit, refund the sender
            requests.post(f"{BANK_SERVERS[sender_bank]}/credit", json={
                "phone": sender_phone,
                "amount": amount
            })
            return jsonify(credit_response.json()), credit_response.status_code

        return jsonify({"message": "Payment processed successfully"}), 200

    except requests.RequestException as e:
        print(f"Error processing payment: {str(e)}")
        return jsonify({"error": "bank_communication_error", "message": "Error processing payment"}), 500
    
@app.route('/check_balance', methods=['POST'])
def check_balance():
    data = request.json
    phone_number = data.get('phoneNumber')
    upi_pin = data.get('upiPin')

    if not phone_number or not upi_pin:
        return jsonify({"error": "missing_data", "message": "Phone number and UPI PIN are required"}), 400

    ref = db.reference()
    user_data = ref.child('users').child(phone_number).get()

    if not user_data:
        return jsonify({"error": "not_found", "message": "User not found"}), 404

    bank_name = user_data['bank_name']

    try:
        # Forward the request to the appropriate bank server
        response = requests.post(f"{BANK_SERVERS[bank_name]}/check_balance", json={
            "phone": phone_number,
            "upi_pin": upi_pin
        })

        return jsonify(response.json()), response.status_code

    except requests.RequestException as e:
        print(f"Error communicating with bank server: {str(e)}")
        return jsonify({"error": "bank_communication_error", "message": "Error checking balance"}), 500
    
@app.route('/submit_report', methods=['POST'])
def submit_report():
    data = request.json
    sender_phone = data.get('senderPhoneNumber')
    recipient_phone = data.get('recipientPhoneNumber')
    description = data.get('description')

    if not sender_phone or not recipient_phone or not description:
        return jsonify({"error": "missing_data", "message": "All fields are required"}), 400

    ref = db.reference()
    users_ref = ref.child('users')

    # Check if recipient exists
    recipient_data = users_ref.child(recipient_phone).get()
    if not recipient_data:
        return jsonify({"error": "not_found", "message": "Recipient not found"}), 404

    # Update recipient's report count and add description to reports
    recipient_ref = users_ref.child(recipient_phone)
    current_report_count = recipient_data.get('reportCount', 0)
    current_reports = recipient_data.get('reports', [])

    recipient_ref.update({
        'reportCount': current_report_count + 1,
        'reports': current_reports + [description]
    })

    return jsonify({"message": "Report submitted successfully"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
