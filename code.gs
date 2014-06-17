/**
* This Google Apps Script works on Google Drive and is responsible to copy files and folders from SOURCE directory to DESTINATION directory.
* It doesn't support retention of previous viewers. So, you need to manually share the folder and its files to individual persons accordingly.
*
* @author      Prince Raj <prince.nsit@gmail.com>
* @version     1.0
* @since       2014-06-14
*/

// ----- variables inside this block are user configurable -----

// Set this to true, if you want to copy files and folders from root folder.
// Note: If true, then {@value #SOURCE_FOLDER_NAME_ID} won't be considered!
var COPY_FROM_ROOT = true;

// Set this variable only if {@value #COPY_FROM_ROOT} is false.
// In order to set this, fetch id for a given source folder by visiting that google drive folder in new tab and extracting id=<ID> from URL.
// Note: Default value is empty. Set this for proper functioning of script.
var SOURCE_FOLDER_NAME_ID = "";

// Set this to true, if you want to copy files and folders to root folder.
// Note: If true, then {@value #DESTINATION_FOLDER_NAME} won't be considered!
var COPY_TO_ROOT = true;

// Set this variable only if {@value #COPY_TO_ROOT} is false.
// Note: Default value is "MY_DRIVE_BACKUP" and will be created under root directory. Set this accordingly.
var DESTINATION_FOLDER_NAME = "MY_DRIVE_BACKUP";

// ----- variables inside this block are user configurable -----


// ---- main code starts here -----

// Exclude this script when copying to Drive
var EXCLUDE_SCRIPT = "DriveMigrator";

// Root folder
var ROOT_FOLDER = DriveApp.getRootFolder();

// Error messages
var errors = [];

function main() {
    // Clears the previous log
    Logger.clear();

    var fromFolder;
    if (COPY_FROM_ROOT) {
        fromFolder = ROOT_FOLDER;
    } else {
        if (SOURCE_FOLDER_NAME_ID) {
            fromFolder = DriveApp.getFolderById(SOURCE_FOLDER_NAME_ID);
        } else {
            Logger.log("SOURCE_FOLDER_NAME_ID is not set");
            return;
        }
    }

    var toFolder;
    if (COPY_TO_ROOT) {
        toFolder = ROOT_FOLDER;
    } else {
        if (DESTINATION_FOLDER_NAME) {
            toFolder = DriveApp.createFolder(DESTINATION_FOLDER_NAME);
        } else {
            Logger.log("DESTINATION_FOLDER_NAME is not set");
            return;
        }
    }

    // Recursive copy
    recursiveCopy_(fromFolder, toFolder);

    // Send email
    sendEmail_();
}

function recursiveCopy_(fromFolder, toFolder) {
    var destFolder = copyFolder_(fromFolder, toFolder);
    copyFiles_(fromFolder, destFolder);

    var folders = fromFolder.getFolders();
    while (folders.hasNext()) {
        var fromFolder = folders.next();
        recursiveCopy_(fromFolder, destFolder);
    }
}

function copyFolder_(fromFolder, toFolder) {
    var destFolder;
    if (ROOT_FOLDER == fromFolder) {
        destFolder = ROOT_FOLDER;
    } else {
        var srcFolderName = fromFolder.getName();
        destFolder = toFolder.createFolder(srcFolderName);
    }
    return destFolder;
}

function copyFiles_(fromFolder, destFolder) {
    var files = fromFolder.getFiles();
    while (files.hasNext()) {
        var file = files.next();
        var fileName = file.getName();
        if (fileName != EXCLUDE_SCRIPT) {
            var url = file.getUrl();
            var destFolderName = destFolder.getName();
            try {
                file.makeCopy(fileName, destFolder);
                Logger.log("[Success] Copy file: [%s][%s] to folder: [%s]\n", fileName, url, destFolderName);
            } catch (error) {
                var errorMessage = url + "\n" + error;
                errors.push(errorMessage);
                Logger.log("[Failure] Copy file: [%s][%s] to folder: [%s], error: [%s]\n", fileName, url, destFolderName, error.message);
            }
        }
    }
}

function sendEmail_() {
    // Get the email subject line
    var subject;

    // Get the email body
    var body;

    if (errors.length > 0) {
        subject = "[Alert]";
        body = "Following links failed to copy:"
        for (var i in errors) {
            body += "\n\n" + errors[i];
        }
    } else {
        subject = "[Success]";
        body = "All looks good!"
    }
    subject += " Copy Google Drive";
    body += "\n\nP.S. See attachment for complete logs.";

    // Get the email address of the active user - that's you.
    var email = Session.getActiveUser().getEmail();

    var logs = Logger.getLog();
    var attachment = DocsList.createFile('status.log', logs);

    // Send an email with attachment
    GmailApp.sendEmail(email, subject, body, {
        attachments: [attachment]
    });

    attachment.setTrashed(true);
}

// ----- main code ends here -----
