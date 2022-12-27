# cumulativeTracksWeb
Display all .igc tracks cumulated on the same map


## CORS and GCP Bucket
In order to set CORS when retrieving content from a GCP bucket you need to run:
gsutil cors set gcp-cors.json gs://{bucket-name}

Use https://<bucket name>.storage.googleapis.com as the URL

https://tracemap-trace-aggregator.storage.googleapis.com