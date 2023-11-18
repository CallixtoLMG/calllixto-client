// const config = require('../../config');
// const { Logger } = require('../../logger');
// const { log } = Logger.getInstance();
// const { rp } = require('@kbs/kelsus-s2s-auth');

// function request(method, endpoint, qs, body) {
//   const { url, client } = config.s2s.submissionEtl;
//   log.debug('SUBMISSION-ETL_DEBUG: Using S2S config: ', { config: config.s2s.submissionEtl });
//   return rp({
//     url: `${url}/${endpoint}`,
//     method,
//     body,
//     clientName: client,
//     qs,
//     headers: {
//       'content-type': 'application/json'
//     },
//     json: true
//   })
//     .then(response => {
//       log.debug('SUBMISSION-ETL_DEBUG: Success to call forms-server using s2s.');
//       return response;
//     })
//     .catch(error => {
//       log.debug('SUBMISSION-ETL_DEBUG: Failed to call forms-server using s2s.', { error });
//       throw error;
//     });
// }

// function GET(endpoint, qs) {
//   return request('GET', endpoint, qs);
// }

// function POST(endpoint, qs, body) {
//   return request('POST', endpoint, qs, body);
// }

// function PATCH(endpoint, qs, body) {
//   return request('PATCH', endpoint, qs, body);
// }

// function DELETE(endpoint, qs) {
//   return request('DELETE', endpoint, qs);
// }

// module.exports = {
//   GET,
//   POST,
//   DELETE,
//   PATCH
// };

// function getSites(params) {
//   const path = `api/kbs-sites/`;
//   return GET(path, params);
// }