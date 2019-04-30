const Algorithmia = require('algorithmia');
const sbd = require('sbd');
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1');
require('dotenv').config();

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: process.env.WATSON_CREDENTIALS,
  version: '2018-04-05',
  url: process.env.NLU_URL
});

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
    articleName: searchTherm
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
};

const limitMaximumSentences = content => {
  content.sentences = content.sentences.slice(0, content.maximumSentences);
};

const fetchWatsonAndSetKeywords = async sentence => {
  const { text } = sentence;

  const result = await nlu.analyze({
    text,
    features: {
      keywords: {}
    }
  });

  sentence.keywords = result.keywords.map(keyword => keyword.text);
};

const textRobot = async content => {
  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
  breakTextIntoSentences(content);
  limitMaximumSentences(content);
  const promises = content.sentences.map(sentence => fetchWatsonAndSetKeywords(sentence));
  await Promise.all(promises);

  console.log('---------> ', content.sentences);
};

module.exports = { textRobot };
