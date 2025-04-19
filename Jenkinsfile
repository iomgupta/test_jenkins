pipeline {
    agent any

    environment {
        // Define global environment variables
        APP_NAME = 'sample-nodejs-app'
        DOCKER_REGISTRY = 'your-registry-url'
        DOCKER_CREDENTIALS = 'docker-credentials-id'
    }
    
    triggers {
        // Poll SCM every 2 minutes for changes
        pollSCM('H/2 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}"
                echo "Triggered by changes in the repository"
            }
        }
        
        stage('Build') {
            steps {
                echo "Building ${env.APP_NAME}..."
                sh 'npm install'
            }
        }
        
        stage('Unit Tests') {
            steps {
                echo "Running unit tests..."
                sh 'npm test'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: '**/test-results/*.xml'
                }
            }
        }
        
        stage('Code Analysis') {
            steps {
                echo "Running code analysis..."
                sh 'npm run sonar || true'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo "Building Docker image..."
                sh """
                    docker build -t ${DOCKER_REGISTRY}/${APP_NAME}:${env.BRANCH_NAME}-${env.BUILD_NUMBER} .
                    docker tag ${DOCKER_REGISTRY}/${APP_NAME}:${env.BRANCH_NAME}-${env.BUILD_NUMBER} ${DOCKER_REGISTRY}/${APP_NAME}:latest
                """
            }
        }
        
        stage('Push Docker Image') {
            steps {
                echo "Pushing Docker image to registry..."
                withCredentials([string(credentialsId: DOCKER_CREDENTIALS, variable: 'DOCKER_PASSWORD')]) {
                    sh """
                        docker login ${DOCKER_REGISTRY} -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                        docker push ${DOCKER_REGISTRY}/${APP_NAME}:${env.BRANCH_NAME}-${env.BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/${APP_NAME}:latest
                    """
                }
            }
        }
        
        stage('Deploy to Test') {
            when {
                expression { env.BRANCH_NAME == 'test' }
            }
            steps {
                echo "Deploying to TEST environment..."
                sh """
                    kubectl --namespace=test apply -f kubernetes/deployment.yaml
                    kubectl --namespace=test set image deployment/${APP_NAME} ${APP_NAME}=${DOCKER_REGISTRY}/${APP_NAME}:${env.BRANCH_NAME}-${env.BUILD_NUMBER}
                """
            }
        }
        
        stage('Integration Tests') {
            when {
                expression { env.BRANCH_NAME == 'test' }
            }
            steps {
                echo "Running integration tests against TEST environment..."
                sh 'npm run integration-tests || true'
            }
        }
        
        stage('Deploy to Staging') {
            when {
                expression { env.BRANCH_NAME == 'release' }
            }
            steps {
                echo "Deploying to STAGING environment..."
                sh """
                    kubectl --namespace=staging apply -f kubernetes/deployment.yaml
                    kubectl --namespace=staging set image deployment/${APP_NAME} ${APP_NAME}=${DOCKER_REGISTRY}/${APP_NAME}:${env.BRANCH_NAME}-${env.BUILD_NUMBER}
                """
            }
        }
        
        stage('Regression Tests') {
            when {
                expression { env.BRANCH_NAME == 'release' }
            }
            steps {
                echo "Running regression tests against STAGING environment..."
                sh 'npm run regression-tests || true'
            }
        }
        
        stage('Deploy to Production') {
            when {
                expression { env.BRANCH_NAME == 'deployment' }
            }
            steps {
                input message: "Deploy to production environment?"
                
                echo "Deploying to PRODUCTION environment..."
                sh """
                    kubectl --namespace=production apply -f kubernetes/deployment.yaml
                    kubectl --namespace=production set image deployment/${APP_NAME} ${APP_NAME}=${DOCKER_REGISTRY}/${APP_NAME}:${env.BRANCH_NAME}-${env.BUILD_NUMBER}
                """
            }
        }
    }
    
    post {
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed!"
        }
        always {
            cleanWs()
        }
    }
}
