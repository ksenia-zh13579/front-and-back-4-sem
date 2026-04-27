module.exports = {
    apps: [
        {
            name: 'express-app',
            script: 'app.js',
            instances: 3,          
            exec_mode: 'fork',    
            increment_var: 'PORT', 
            env: {
                PORT: 3000,
            },
            args: '3000', 
        },
    ],
};