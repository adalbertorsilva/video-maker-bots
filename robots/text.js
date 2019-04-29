const Algorithmia = require('algorithmia');
const sbd = require('sbd');
require('dotenv').config();
const removeBlankLinesAndMarkdown = text =>
  text
    .split('\n')
    .filter(line => line.length !== 0)
    .filter(phrase => !phrase.trim().startsWith('=='))
    .join(' ')
    .replace(/\((?:\([^()]*\)|[^()])*\)/gm, '')
    .replace(/ {2}/g, ' ');

const fetchContentFromWikipedia = async content => {
  const { searchTherm } = content;

  const input = {
    articleName: searchTherm,
    lang: 'pt'
  };
  const response = await Algorithmia.client(process.env.ALGORITHMIA_API_KEY)
    .algo(process.env.ALGORITHMIA_ALGORITHM)
    .pipe(input);

  content.sourceContent = response.get();
};

const sanitizeContent = content => {
  const { sourceContent } = content;
  const edittedContent = removeBlankLinesAndMarkdown(sourceContent.content);

  content.edittedContent = edittedContent;
};

const breakTextIntoSentences = content => {
  const { edittedContent } = content;
  const sentences = sbd.sentences(edittedContent);

  content.sentences = sentences.map(sentence => ({ text: sentence, keywords: [], images: [] }));
  console.log('-----> ', content.sentences);
};

const textRobot = async content => {
  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
  breakTextIntoSentences(content);
  console.log(`Content recebido com sucesso: ${content.searchTherm}`);
};

module.exports = { textRobot };
