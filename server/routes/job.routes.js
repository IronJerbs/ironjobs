const jobRouter = require('express').Router();
const Job = require('../models/Job.model.js');

/**
 * Translates Mongo database schema into the client's API specifications
 * @param   {Object}  job   Takes in mongo's job schema
 * @return  {Object}        A new object with properties matching the client's API specifications
 */
function newJobObjectForClient(job) {
  return { 'company': job.company, 'link': job.link, 'id': job.id, 'createTime': job.createTime};
}

/**
 * Retrieves all the jobs in the database, unless a query is provided in
 * which case all jobs matching that company are returned
 * @param   {Object}    request     Request may have a query
 * @param   {Object}    response    Responds with an array of jobs
 * @param   {Function}  next
 * @return  {Void}
 */
jobRouter.get('/', function showAllJobs(request, response, next){
  let searchTerms = {};

  if (request.query.query){
    searchTerms.company = {$regex: request.query.query, $options: 'i'};
  }

  Job.find(searchTerms)
    .then(function sendBackMatchingJobs(allMatchingInfo) {
      console.log(allMatchingInfo);

      response.json(allMatchingInfo.map(newJobObjectForClient));
    })
    .catch(function handleIssues(err) {
      console.error(err);
      let ourError = new Error('There was an error finding the job');
      ourError.status = err.status;
      next(err);
    });
});

/**
 * Retrieves a single job from the database
 * @param   {Object}    request     Request provided with id
 * @param   {Object}    response    Responds with the new object for the client
 * @param   {Function}  next
 * @return  {Void}
 */
jobRouter.get('/:id', function retrieveSingleJob(request, response, next) {
  console.log('Request params', request.params.id);

  Job.findById(request.params.id)
    .then(function sendBackSingleJob(theJobInfo) {

      if (!theJobInfo) {
        let err = new Error('No job with that ID');
        err.status = 404;
        return next(err);
      }
      response.json(newJobObjectForClient(theJobInfo));
    })
    .catch(function handleIssues(err) {
      console.error(err);
      let ourError = new Error('There was an error finding the job with that ID');
      ourError.status = err.status;
      next(err);
    });
});

/**
 * Deletes a job in the database
 * @param   {Object}    request     Request matched by id
 * @param   {Object}    response    The job to be removed
 * @param   {Function}  next
 * @return  {Void}
 */
jobRouter.delete('/:id', function deleteJob(request, response, next) {
  Job.findById(request.params.id)
    .then(function deleteTheJob(theJobInfo) {
      if(!theJobInfo) {
      let err = new Error('Job to delete is not found');
      err.status = 404;
      return next(err);
    }
      theJobInfo.remove();
      response.json(theJobInfo);
    })
    .catch(function handleIssues(err) {
      console.error(err);
      let ourError = new Error('There was an error finding the job');
      ourError.status = err.status;
      next(err);
    });
});

/**
 * Adds a job to the array of jobs in the database
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
