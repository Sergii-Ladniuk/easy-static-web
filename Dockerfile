FROM ubuntu:14.04
MAINTAINER Sergii Ladniuk <sergii.ladniuk@gmail.com>
RUN apt-get update
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get install -y nodejs
RUN apt-get install -y git
ADD keys/* /tmp/
RUN ssh-agent /tmp
ADD install.sh .
RUN sh ./install.sh
