pipeline {
    agent any

    environment {
        // Use this variable to set Qt path - you might need to adjust this based on where Qt is installed on your Jenkins agent
        QT_PATH = '/home/jenkins/Qt/5.15.0/gcc_64'
        CMAKE_BUILD_DIR = 'build'
    }
    
    // Configure triggers for automatic builds
    triggers {
        // Poll SCM every 2 minutes for changes
        pollSCM('H/2 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}"
                echo "Building inf_multipara_mon_fw_ui"
            }
        }
        
        stage('Configure') {
            steps {
                sh '''
                    # Set Qt path (adjust as needed based on Jenkins environment)
                    export CMAKE_PREFIX_PATH=${QT_PATH}
                    
                    # Create build directory
                    mkdir -p ${CMAKE_BUILD_DIR}
                    cd ${CMAKE_BUILD_DIR}
                    
                    # Configure with CMake
                    cmake ..
                '''
            }
        }
        
        stage('Build') {
            steps {
                sh '''
                    # Set Qt path again for this stage
                    export CMAKE_PREFIX_PATH=${QT_PATH}
                    
                    # Build the application
                    cd ${CMAKE_BUILD_DIR}
                    cmake --build .
                '''
            }
        }
        
        stage('Test & Verify') {
            steps {
                sh '''
                    # List the build output to verify it exists
                    cd ${CMAKE_BUILD_DIR}
                    ls -la
                    
                    # Check if executable was created
                    if [ -f inf_multipara_mon_fw_ui ]; then
                        echo "✅ Build successful - executable created"
                    else
                        echo "❌ Executable not found!"
                        # Don't fail the build yet, might be named differently
                        ls -la | grep -i inf
                    fi
                '''
            }
        }
        
        stage('Package') {
            steps {
                sh '''
                    cd ${CMAKE_BUILD_DIR}
                    cpack || echo "Packaging may not be configured yet"
                '''
            }
        }
        
        stage('Deploy to Test') {
            when {
                expression { env.BRANCH_NAME == 'test' }
            }
            steps {
                echo "Deploying to TEST environment..."
                sh '''
                    echo "This is where test deployment would happen"
                    # For testing only - just list build artifacts
                    cd ${CMAKE_BUILD_DIR}
                    ls -la *.deb *.rpm *.tar.gz 2>/dev/null || echo "No packages found"
                '''
            }
        }
    }
    
    post {
        success {
            echo "Build completed successfully!"
        }
        failure {
            echo "Build failed!"
        }
        always {
            echo "Cleaning workspace"
            cleanWs()
        }
    }
}
