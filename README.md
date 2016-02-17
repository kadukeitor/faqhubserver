# FaqHubServer

## Inspiration

Our goal is to facilitate the interaction between business and users. Using IBM Watson as the core of this project allow us to put in your hand an easily customizable tool that supports intuitive and appealing user interactions. Make your business frequently asked questions available 24/7 will help you attract clients. Let FaqHub handle all of that for you. You only need to login in our website and create a topic about your company and add your most frequently asked questions and answers and they will be available for your users in all the most popular platforms.

## What it does

FaqHub can be divided in two major categories: 

1. Users that want to make their topics accessible to their consumers:  After you login in our webpage, you need to create a topic (name of your company etc.) and start creating your pool of frequently asked questions and their respective answer. After the FaqHub admins review your content it will be available for everybody. 
2. Users that want to know about an specific topic(s): Just need to interact with FaqHub and dive in its pool of knowledge. We have a FaqHub client version on all the most popular platforms. 

## How we built it

The project contains two fundamental parts.

### Client

Responsible for consuming all the data generated on the Editor. We have clients in the most popular platforms , Web , Android, and iOS (pending review).

### Server

Based on IBM Bluemix infrastructure and with the NodeJS SDK, we use services like: 

- **Cloudant** to storage the topics database.
- **Dialog** ( Watson ) to create the user interaction with our system. 
- **Speech to Text**  ( Watson ) to allow users to interact with our client by speaking. 
- **Text to Speech** ( Watson ) to interact with the users. 
- **Language Translation** ( Watson ) to make our content accessible in multiple languages. 

Also we used 3rd party services like:

- **CloudConvert** to convert audio stream from .ogg to .mp3.
- **Amazon AWS** to cache the converted audio streams.

## Challenges we ran into

Studying and learning this exciting technology that was totally new for us in general. Generating and interactive dialog that will allow us to present information to users. 
The mobile application integration with some of the services, for example Text to Speech and the inability to play *.ogg files in mobile devices. How to create a way for user to contribute to this project pool of knowledge. Among others.
  
## Accomplishments that we are proud of

We are really happy of this early alpha version of this project, it is impossible for us not to be excited on what this project can become in the future. 
The workarounds and solutions of the challenges we found has made use grow as programmers and friends working together. Although, we have a lot of things to improve/add to this project
 
## What's next for FaqHub

We are actively looking for people or institutions that can fund/collaborate with this project to take it to the next level. Below are some of the projections of this project so far:

### Alpha:

- Dialog improvement: Allow users to suggest topic(s) that are not in the pool of knowledge to be reviewed/added by our team. Add conversation routes to improve user experience.
- iOS clearance from iTunes (although you can contact us to test it using TestFlight).
- Create a Windows Phone client.
- Use Single Sign On Bluemix service to create the social logins.
- Use Bluemix Workload Scheduler to schedule updates of the Dialogs.
- Use an Analytic Service provided by Bluemix..
- Use Watson Document Conversion services to export interactions.
- Upgrade the process to approve/deny Topics.
- Use wildcards for topics names.
- Create a verification structure.
- Approve or deny specific items.
- Generate tickets for approval/denies to directly interact with users.

### Beta:

- User interface graphic improvement.
- Generate an unique icon.
- Generate promotional videos.
- Advertising of the product to make it visible in the community.
- Allow institutions to be manager of their own topics without reviewing.



