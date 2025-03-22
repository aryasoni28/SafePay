from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import db, credentials
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize Firebase Realtime Database
cred = credentials.Certificate("sbicredentials.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://sbibank-553ad-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

BANK_NAME = "SBI"

@app.route('/create_account', methods=['POST'])
def create_account():
    data = request.json
    name = data.get('name')
    phone_number = data.get('phoneNumber')
    upi_pin = data.get('upiPin')
    balance = data.get('balance')

    if not name or not phone_number or not upi_pin or not balance:
        return jsonify({"message": "All fields are required"}), 400

    # Reference to the Firebase Realtime Database root
    ref = db.reference()

    # Use phone_number as the user_id
    new_user_ref = ref.child(BANK_NAME).child(phone_number)

    # Check if the user already exists
    if new_user_ref.get() is not None:
        return jsonify({"message": "User with this phone number already exists"}), 400

    # Set the user data
    new_user_ref.set({
        'name': name,
        'phone_number': phone_number,
        'upi_pin': upi_pin,
        'balance': float(balance),
    })

    return jsonify({"message": "User account created successfully", "user_id": phone_number}), 200

@app.route('/check_account/<phone_number>', methods=['GET'])
def check_account(phone_number):
    ref = db.reference()
    user_ref = ref.child(BANK_NAME).child(phone_number)
    
    if user_ref.get() is None:
        return jsonify({"message": "Account not found"}), 404
    
    return jsonify({"message": "Account exists"}), 200

@app.route('/syn', methods=['POST'])
def syn():
    data = request.json
    phone = data.get('phone')
    return jsonify({"message": "ACK", "phone": phone}), 200

@app.route('/debit', methods=['POST'])
def debit():
    data = request.json
    phone = data.get('phone')
    amount = data.get('amount')
    upi_pin = data.get('upi_pin')

    if not phone or not amount or not upi_pin:
        return jsonify({"message": "All fields are required"}), 400

    ref = db.reference()
    user_ref = ref.child(BANK_NAME).child(phone)
    user_data = user_ref.get()

    if user_data is None:
        return jsonify({"message": "Account not found"}), 404

    if user_data['upi_pin'] != upi_pin:
        return jsonify({"message": "Invalid UPI PIN"}), 401

    current_balance = float(user_data['balance'])
    if current_balance < float(amount):
        return jsonify({"message": "Insufficient balance"}), 400

    new_balance = current_balance - float(amount)
    user_ref.update({"balance": new_balance})

    return jsonify({"message": "Amount debited successfully", "new_balance": new_balance}), 200

@app.route('/credit', methods=['POST'])
def credit():
    data = request.json
    phone = data.get('phone')
    amount = data.get('amount')

    if not phone or not amount:
        return jsonify({"message": "All fields are required"}), 400

    ref = db.reference()
    user_ref = ref.child(BANK_NAME).child(phone)
    user_data = user_ref.get()

    if user_data is None:
        return jsonify({"message": "Account not found"}), 404

    new_balance = float(user_data['balance']) + float(amount)
    user_ref.update({"balance": new_balance})

    return jsonify({"message": "Amount credited successfully", "new_balance": new_balance}), 200

@app.route('/check_balance', methods=['POST'])
def check_balance():
    data = request.json
    phone = data.get('phone')
    upi_pin = data.get('upi_pin')

    if not phone or not upi_pin:
        return jsonify({"message": "Phone number and UPI PIN are required"}), 400

    ref = db.reference()
    user_ref = ref.child(BANK_NAME).child(phone)
    user_data = user_ref.get()

    if user_data is None:
        return jsonify({"message": "Account not found"}), 404

    if user_data['upi_pin'] != upi_pin:
        return jsonify({"message": "Invalid UPI PIN"}), 401

    balance = user_data['balance']

    return jsonify({"message": "Balance retrieved successfully", "balance": balance}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
