# rest-api
At the moment, there are five api requests in this service.
 
* To search for a file - http://localhost:4000/api/find
* To see all the files-  http://localhost:4000/api/findAll
* To update the file- http://localhost:4000/api/update
* To delete a file- http://localhost:4000/api/delete
* To delete all files -http://localhost:4000/api/deleteALL

Testing of this service was checked with Postman with the parameters that are indicated on the screenshot

![image](https://user-images.githubusercontent.com/60476724/179405866-905e2cf8-c81f-4ff9-a1d0-52ac30ead260.png)

In this service I also implemented a check for the count of elements and if there are more than 10, then we find the oldest element and overwrite it with a new value.
