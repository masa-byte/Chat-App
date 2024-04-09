To run the application, you need to have Node.js installed, along with npm, ng for Angular, and nest for Nest.
I've written a setup.ps1 script that will download Node.js if you don't already have it, then install it. After that, rerun setup.ps1, which will install ng and nest. Finally, running setup.ps1 again will start the server and 2 clients, opening them in a web browser.

The application is designed to work for multiple clients, but you need to assign a port for each client in the config files, both for the backend and frontend, along with an ID and name.
If you want to try it with 3 clients, the config files are configured (uncomment the part), and you just need to add the following line in package.json:
"start:client3": "cd chat-frontend && start /B ng serve --port 4202 -o"
(and a comma at the end of the previous line)

All CRUD methods are implemented, but only two are used by the client for now, as it was part of the task. Since almost everything is implemented asynchronously, there is no blocking or waiting.
I wanted CRUD operations on messages to go through HTTP requests rather than sockets because sockets are used for notifications from the file system watcher.
Since fsPromises is used everywhere, there are no race conditions as all operations are executed asynchronously.
Also, all file system watchers are asynchronous, so all changes should be detected correctly.
Encrypted files are stored in the files/encrypted directory, which acts as a kind of database, and when they reach the client, decryption is performed on the client side and written to files/decrypted, simulating the user downloading a file, decrypting it locally, and saving it.

There is a separate C# application responsible for encrypting and decrypting messages, as TypeScript doesn't work well with it.
This application also hashes files for integrity verification.
It is located in the Ciphers folder and will be run with dotnet run along with the rest of the application.

Shared folders are created, and if there are changes between chats, messages created DURING THAT SESSION will be loaded.
When the session ends and another one starts, all folders are deleted and new ones are created.

To free up ports at the end, use the following commands:
netstat -ano | findstr :<port>
which gives the PID of the process using the given port, then
taskkill /PID <PID> /F


