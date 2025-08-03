const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.get('/', (req, res) => {
  res.send('BudgetWise AI Server is running');
});

app.listen(port, () => {
  console.log('BudgetWise AI Server is running');
});
