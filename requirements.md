## Vision
The vision of this project is to create a collaborative and user-friendly platform to document things.
## Requirements
1. The platform should allow users to create, edit, and delete documents.
2. The platform should support real-time collaboration, allowing multiple users to edit the same document simultaneously
3. The platform should have a version control system to track changes and allow users to revert to previous versions of a document.
4. The platform should have a user authentication system to ensure that only authorized users can access and edit documents.
5. The platform should have a search functionality to allow users to easily find documents based on keywords or tags.
6. The platform should have a commenting system to allow users to provide feedback and discuss the content of the documents.
7. The platform should have a responsive design to ensure that it can be accessed and used on various devices, including desktops, tablets, and smartphones.
8. The platform should have a secure and scalable infrastructure to handle a large number of users and documents.

### Persistance
- All Documents must be persisted in a local git.
- Every "Space" has its own git repository, which is (at least in Milestone 1) created by hand.
- Every change to a document must be committed to the git repository, with a commit message that describes the change.
- Changes by users must be tracked in the git repository, allowing for version control and the ability to revert to previous versions of a document.

### Data model / Domain model
- User: Represents a user of the platform, with attributes such as username, email, and password.
- Document: Represents a document created by a user, with attributes such as title, content

## In Scope
### Milestone 1
- Implement the core functionalities of document creation, editing, and version control.
- Build the backend infrastructure to support document management and collaboration.
- Set up a basic database to store documents and their versions.
- Implement a simple API to allow for document management and collaboration.

## Out of Scope
### Milestone 1
- No User interface (UI) is required for the first milestone. The focus will be on building the backend infrastructure and implementing the core functionalities of document creation, editing, and version control.
- No authentication system will be implemented in the first milestone. The focus will be on building the core functionalities of document management and collaboration.
- No search functionality will be implemented in the first milestone. The focus will be on building the core functionalities of document management and collaboration.
- No commenting system will be implemented in the first milestone. The focus will be on building the
- No automated testing will be implemented in the first milestone. The focus will be on building the core functionalities of document management and collaboration.

## Coding Standards
- The Software should be developed using Java 21.
- Spring Boot should be used as the framework for building the backend infrastructure.
- The code should follow standard Java coding conventions and best practices.
- The code should be well-documented and include comments to explain the functionality of different components.
- Main functionalities must be controlled by API endpoints, which should be well-defined and follow RESTful principles.

## Current Status
- Milestone 1