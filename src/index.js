const vulnerabilitiesNotifier = require('./lambda/vulnerabilities-notifier');
const imageScanner = require('./lambda/image-scanner');
const scanResultsAnalyser = require('./lambda/scan-results-analyser');

module.exports.startImageScan = async event => {
  await imageScanner.scan();
};

module.exports.analyseScanResults = async event => {
  await scanResultsAnalyser.analyse();
};

module.exports.notifyVulnerabilities = async event => {
  await vulnerabilitiesNotifier.notify(event.Records);
};