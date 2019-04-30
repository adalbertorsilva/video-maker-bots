const { textRobot, userInput } = require('./robots');

const start = async () => {
  const content = userInput();
  await textRobot(content);
};

(async () => start())();
