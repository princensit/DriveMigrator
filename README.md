DriveMigrator
=============

This Google Apps script migrate/copy Google Drive files and folders (with hierarchy) from one gmail account to another gmail account.

Note: It doesn't support retention of previous viewers. This could have been possible if two gmail accounts belonged to same domain. So, you need to manually share the folder and its files to individual persons accordingly.


### Some notable points:
* Assumption that new gmail account's google drive is clean, if not then it creates copy of them also (which can be manually deleted later, so not a big issue).
* As per https://developers.google.com/apps-script/guides/services/quotas, script runtime is set to 6 min / execution, which means if you have lot of files and folders in older google drive and copy takes more than 6 minutes, then it will end prematurely. (So, we need to find a way to make this script parallelizable, persisting older state, TODO yada yada)
* Before that, in order to overcome this limitation, added field 'SOURCE_FOLDER_NAME_ID' to specify which specific folder to copy from older to newer drive. See comments present in the script.
* This script has email support to let you know the status of current migration done, with logs as attachment.


### Now, let's start:
* Go to `https://drive.google.com/a/<older-domain>.com` and share all files and folders to new `<your-user-name>@<new-domain>`.com
* Go to http://www.google.com/script/start/ 
* Copy the content of this script and save project/file with name "DriveMigrator".
* If folders and files are many and expected to take > 6 minutes, then I suggest to set 'SOURCE_FOLDER_NAME_ID' with folder id and COPY_FROM_ROOT to false.
* Select 'main' function and then run the script.
* Do this for different 'SOURCE_FOLDER_NAME_ID', if required.


Feedback comments on script and questions are welcome.
