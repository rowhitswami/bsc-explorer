# OpenCity Frontend Problem Statement
## Demo
Link: [https://bsc-explorer.herokuapp.com/](https://bsc-explorer.herokuapp.com/)

## About OpenCity
OpenCity.in is a data portal focussed on city-level data and its usage. It was developed in collaboration between the Oorvani Foundation and DataMeet, a community of Data Science and Open Data enthusiasts.
The platform helps citizens and civil society by bringing visibility and transparency into local governance and enabling data-driven decision making.

## Problem Statement
Using open-source libraries like D3.js, NVD3.js, Leaflet.js, Deck.gl, ReactJS, Angular and more to analyse the connectivity of schools across Bangalore, on the basis of various parameters like connectivity with bus routes, distance of schools from roads etc. 

## Approach
Created 4 section to explain the connectivity between schools in Bangalore city.
1. __Overview__ - A high-level view of schools connectivity with bus stops, bus routes, and urban area boundary of Bangalore city.
![](https://i.imgur.com/6D1Cjjk.png)
2. __Bus Route__ - Reachability of schools near a route and bus stops.
![](https://i.imgur.com/Hp342Nd.png)
3. __Clustered Bus Stops__
![](https://i.imgur.com/Cb7jlOT.png)
4. __Clustered Schools__
![](https://i.imgur.com/q1c2TYE.png)

## Installation
The Code is written in Python 3.7. If you don't have Python installed you can find it [here](https://www.python.org/downloads/). If you are using a lower version of Python you can upgrade using the pip package, ensuring you have the latest version of pip. To install the required packages and libraries, run this command in the project directory after [cloning](https://www.howtogeek.com/451360/how-to-clone-a-github-repository/) the repository:
```bash
pip install -r requirements.txt
```
## Run
To run the app in a local machine, shoot this command in the project directory:
```bash
gunicorn wsgi:app
```
and visit
```bash
http://localhost:8000/
```
## Team
[![Rohit Swami](https://avatars1.githubusercontent.com/u/16516296?v=3&s=144)](https://rohitswami.com/) |
-|
[Rohit Swami](https://rohitswami.com/) |)

## License
[![The MIT License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge&logo=appveyor)](https://opensource.org/licenses/MIT)
