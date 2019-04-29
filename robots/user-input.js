const readlineSync = require('readline-sync');

const askAndReturnSeachTherm = () => readlineSync.question('Type a wikipedia search therm: ');

const askAndReturnPrefix = () => {
  const prefixes = ['Who is', 'What is', 'The history of'];
  const selectedPrefix = readlineSync.keyInSelect(prefixes, 'Choose an option: ');
  return prefixes[selectedPrefix];
};

const userInput = () => {
  const content = {};
  content.searchTherm = askAndReturnSeachTherm();
  content.prefixes = askAndReturnPrefix();

  return content;
};

module.exports = { userInput };
