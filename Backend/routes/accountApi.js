import express from 'express';
import AccountController from '../app/Controllers/AccountController';

const ApiRouter = express.Router();

ApiRouter.post('/account/signup', (request, response) => {
  const accountController = new AccountController(response);
  accountController.addAccount(request);
});

ApiRouter.get('/account/login/', (request, response) => {
  const accountController = new AccountController(response);
  accountController.loginAccount(request);
});
export default ApiRouter;
