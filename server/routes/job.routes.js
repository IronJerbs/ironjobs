const jobRouter = require('express').Router();
const Job = require('../models/Job.model.js');

jobRouter.get('/', function showAllJobs(request, response, next){

  Job.find()
  /**
   * Retrieves all jobs in the database
   * @param   {Array} allJobs An array of jobs in the database
   * @return  {Void}
   */
    .then(function sendBackAllJobs(allJobs) {
      response.json(allJobs);
      console.log(allJobs);
    })
    .catch(function handleIssues(err) {
      console.error(err);
      let ourError = new Error('Unable to retrieve jobs');
      ourError.status = 500;
      next(ourError);
    });
});
  // let newJobArray = [];
  // allJobs.forEach(function getJobInfo(job){
  //   newJobArray.push({'id': job.id, 'company':job.company, 'link': job.link});
  // });
  // response.json(newJobArray);

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
