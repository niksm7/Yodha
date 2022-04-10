<img align="right" src="https://user-images.githubusercontent.com/61228436/157578910-83675548-5391-412b-9976-8f05d4e88721.png" width="200px"> 

# YODHA ⚔️   Decentralised Emergency Resources 

![](https://warehouse-camo.ingress.cmh1.psfhosted.org/582ab2eba9d0e0f4acbea2fd883f604349908147/68747470733a2f2f696d672e736869656c64732e696f2f707970692f707976657273696f6e732f74656e736f72666c6f772e7376673f7374796c653d706c6173746963)

# Description 
<img align="right" src="https://user-images.githubusercontent.com/61228436/157580355-000e28c1-79fc-4d27-b017-0a0243501de1.gif" width = "200" height = "200">

<p> Russia has invaded Ukraine. Millions of civilians are caught in the middle of an escalating war and humanitarian crisis, and casualties are rising. The COVID-19 pandemic is an added challenge for communities where violence and uncertainty takes a heavy toll. </p>

<p> Funds collected from donors on Yodha will support Ukrainians in need, with a focus on the most vulnerable, including children and senior citizens, without revealing the personal details of the civilians. When a donor makes a donation against a hospital on the website, the donation is received by them and distributed in a decentralised manner to the patients in need. The patients can then buy the medical services and medicines they need by using the Y-Coins. The donors can also check the genuinity of the website cryptographically and also track the blockchain transactions to ensure that their donation has been used for the cause donated. </p>

## 👩‍💻 Technology Stack
#### *Tools*

- *Front End* : HTML / CSS / JavaScript / jQuery / AJAX / Bootstrap 

- *Back End* : Django / Python 

- *Authentication* : Firebase 

- *Blockchain* : web3 / Solidity / IPFS / Infura


# Clone and Star the Repository

	 git clone https://github.com/niksm7/Yodha.git

# :star: Website Setup

## To Setup 

1. Create and activate an environment


	python -m venv django_env 


	.\django_env\Scripts\activate  (for Windows) or  source django_env/bin/activate  (on Mac and Linux)

2. Make sure you have metamask extension in your browser or else install from here
    https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en 


3. IPFS node is also needed to store and fetch images. Please install the IPFS Command-line from here
    https://docs.ipfs.io/install/command-line/#official-distributions 

    ## then run the IPFS node as
        ipfs daemon


## Install requirements

	pip install -r requirements.txt

## Go inside the Yodha directory
 	
	cd Yodha
 

## Make migrations and migrate

    python manage.py makemigrations

    python manage.py migrate

## Create a super user

    python manage.py createsuperuser

## To run 

	python manage.py runserver 


# :star: Flow Diagrams

## dApp Website

![yodha](https://user-images.githubusercontent.com/61228436/157583240-7196ad6d-ceaa-425b-b07d-b796269a2311.png)

<br>
<br>

# :star: Architecture DIAGRAM

## dApp website

![1](https://user-images.githubusercontent.com/61228436/157581006-45a447da-6c52-4ae5-a70d-d3583dcf0f4b.png)

<br>

## The geeks🤓 behind this initiative:

<table>
  <tr>
    <td align="center"><a href="https://github.com/aishux"><img src="https://avatars.githubusercontent.com/u/61228436?v=4" width="100px;" alt=""/><br /><sub><b>Aishwarya Nathani</b></sub></a><br /></td>
    <td align="center"><a href="https://github.com/niksm7"><img src="https://avatars.githubusercontent.com/u/55614782?v=4" width="100px;" alt=""/><br /><sub><b>Nikhil Mankani</b></sub></a><br /></td>
  </tr>
</table>