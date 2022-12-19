# Portalnesia Website

![Portalnesia](/public/image/screenshot.png)

New design of Portalnesia. Clean. Simple

## Deploy

### First Steps

**If not change dependencies, skip this steps**

- Copy files to server

    - package.json
    - package-lock.json
    - pm2.config.json
    - env files (.env.local, .env.development, .env.production)


- Install production depedencies

    RUN
    
    ```bash
        RUN NODE_ENV=production npm ci
        #or
        npm ci --omit=dev
    ```


### Continuous Development

- Build from local computer

    In local computer, RUN: 

    ```bash
    npm run build && npm run pack
    ```
 
- Copy build files to server

    Copy `/tmp/portalnesia.zip` to server

- Unzip the build files that have been sent to the server

    RUN

    ```bash
    unzip portalnesia.zip
    ```

- Running server

    RUN
    
    ```bash
    pm2 start pm2.config.json
    ```