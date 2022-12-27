#Depending on the operating system of the host machines(s) that will build or run the containers, the image specified in the FROM statement may need to be changed.
#For more information, please see https://aka.ms/containercompat 

FROM ubuntu
RUN apt-get update
RUN apt-get install nginx -y
COPY . /var/www/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
