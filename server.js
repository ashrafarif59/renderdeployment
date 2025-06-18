
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
const return_url = "alrossaisparking://alrossaisparking.com/test"; // Or deep link

function generateSignature(data) {
  const sortedKeys = Object.keys(data).sort();
  const baseString = sha_request_phrase +
    sortedKeys.map(k => `${k}=${data[k]}`).join('') +
    sha_request_phrase;
  return crypto.createHash('sha256').update(baseString).digest('hex');
}

app.post('/generate-form', (req, res) => {
  const { amount, email, reference } = req.body;

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

const PORT = process.env.PORT || 3022;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
