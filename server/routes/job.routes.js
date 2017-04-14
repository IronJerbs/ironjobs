const jobRouter = require('express').Router();
const Job = require('../models/Job.model.js');

jobRouter.get('/', function showAllJobs(request, response, next){

  let searchTerms = {};

  if (request.query.query){
    searchTerms.company = {$regex: request.query.query, $options: 'i'};
  }

  Job.find(searchTerms)
    .then(function sendBackMatchingJobs(allMatchingInfo) {
      response.json(allMatchingInfo);
      console.log(allMatchingInfo);
    })
    .catch(function handleIssues(err) {
      console.log(err);
      next(err);
    });
});


/**
 * Adds a job to the array of jobs
 * @param {Object}   request    Must have a body like: { company: String}
 * @param {Object}   response   Getting back an object with the added job
 */
function addAJob(request, response, next){
  console.log('Incoming!!!!', request.body);

  if(!request.body) {
    let err = new Error('You must provide a job');
    err.status = 400;
    next(err);
    return;
  }

  let theJobCreated = new Job({
    company: request.body.company,
    link: request.body.link,
    notes: request.body.notes,
    createTime: new Date()
  });

  theJobCreated.save()
    .then(function sendBackTheResponse(data) {
      response.json({ message: 'Added the job!', theJobIAdded: data});
    })
    .catch(function handleIssues(err) {
      console.error(err);
      let ourError = new Error('Unable to save new Job');
      ourError.status = 500;
      next(ourError);
    });

}
jobRouter.post('/', addAJob);

module.exports = jobRouter;
