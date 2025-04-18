
This is a sample Node.js application created for demonstrating CI/CD pipelines with Jenkins.

## Project Structure

- `src/`: Application source code
- `test/`: Unit tests
- `kubernetes/`: Kubernetes deployment configurations

## Branches

This repository uses the following branch strategy:

- `development`: For ongoing development work
- `test`: For testing in the test environment
- `release`: For preparing releases in the staging environment
- `deployment`: For production deployments

## CI/CD Pipeline

The Jenkinsfile in this repository defines a CI/CD pipeline that:

1. Builds and runs unit tests on all branches
2. Deploys to the test environment from the `test` branch
3. Deploys to the staging environment from the `release` branch
4. Deploys to production from the `deployment` branch

## Local Development

1. Install dependencies:
npm install

2. Run the application:
npm start

3. Run tests:
npm test
