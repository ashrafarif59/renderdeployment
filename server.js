
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ENV or hardcoded for testing (replace with your real values)
const access_code = "FqpiNanbQE2OJTBqHiPx";
const merchant_identifier = "c48d8628";
const sha_request_phrase = "Pass1Pass!"; // no spaces
//const return_url = "alrossaisparking://alrossaisparking.com/test";
//const encodedReturnUrl = encodeURIComponent(return_url);
const return_url="https://renderdeployment-x8gt.onrender.com/payment-result";

function generateSignature(data) {
  const sortedKeys = Object.keys(data).sort();
  const baseString = sha_request_phrase +
    sortedKeys.map(k => `${k}=${data[k]}`).join('') +
    sha_request_phrase;
  return crypto.createHash('sha256').update(baseString).digest('hex');
}

app.get('/generate-form', (req, res) => {
  const { amount, email, reference } = req.query;

  const fields = {
    access_code,
    amount,
    command: 'PURCHASE',
    currency: 'SAR',
    customer_email: email,
    language: 'en',
    merchant_identifier,
    merchant_reference: reference,
    return_url 
  };

  fields.signature = generateSignature(fields);

  // Build HTML
  let html = `<html><body onload="document.forms[0].submit()">
    <form method="POST" action="https://sbcheckout.payfort.com/FortAPI/paymentPage">`;

  for (let key in fields) {
    html += `<input type="hidden" name="${key}" value="${fields[key]}"/>`;
  }

  html += `</form></body></html>`;

  res.set('Content-Type', 'text/html');
  res.send(html);
});

app.get('/payment-result', (req, res) => {
  const { response_code, merchant_reference } = req.query;

  // Determine payment status
  const status = response_code === '14000' ? 'success' : 'failed';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Processing Payment</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: sans-serif; text-align: center; padding-top: 80px; }
      </style>
    </head>
    <body>
      <h2>Processing your payment...</h2>
      <p>You'll be redirected to the app shortly.</p>
      
    </body>
    </html>
  `;

  res.send(html);
});

const PORT = process.env.PORT || 3022;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
