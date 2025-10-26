#!/usr/bin/env bash 
scp -i "../keys/alex-monitor-server.pem" config/dlq-names.js ubuntu@ec2-34-243-209-202.eu-west-1.compute.amazonaws.com:/home/ubuntu/aws-dlq-monitor/config/.
