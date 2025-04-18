pipeline {
    agent any

    environment {
        // Define global environment variables
        APP_NAME = 'sample-nodejs-app'
        DOCKER_REGISTRY = 'your-registry-url'
        DOCKER_CREDENTIALS = 'docker-credentials-id'
    }
    
    // Configure triggers for automatic builds
    triggers {
        // Poll SCM every 2 minutes for changes
        pollSCM('H/2 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from the repository
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
                    // Publish test results
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
                    # Example deployment commands for test environment
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
                    # Example deployment commands for staging environment
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
                // Add a manual approval step before deploying to production
                input message: "Deploy to production environment?"
                
                echo "Deploying to PRODUCTION environment..."
                sh """
                    # Example deployment commands for production environment
                    kubectl --namespace=production apply -f kubernetes/deployment.yaml
                    kubectl --namespace=production set image deployment/${APP_NAME} ${APP_NAME}=${DOCKER_REGISTRY}/${APP_NAME}:${env.BRANCH_NAME}-${env.BUILD_NUMBER}
                """
            }
        }
    }
    
    post {
        success {
            echo "Pipeline completed successfully!"
            emailext (
                subject: "Build Successful: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
                body: "Pipeline completed successfully for branch ${env.BRANCH_NAME}.\nCheck details at ${env.BUILD_URL}",
                to: 'team@example.com',
                attachLog: true
            )
        }
        failure {
            echo "Pipeline failed!"
            emailext (
                subject: "Build Failed: ${env.JOB_NAME} [${env.BUILD_NUMBER}]",
                body: "Pipeline failed for branch ${env.BRANCH_NAME}.\nCheck console output at ${env.BUILD_URL}",
                to: 'team@example.com',
                attachLog: true
            )
        }
        always {
            // Clean workspace after build
            cleanWs()
        }
    }
}
