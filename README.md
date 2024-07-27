# AST Rule Engine

## Description

A Node.js application for managing and evaluating rules in Abstract Syntax Tree (AST) format using MongoDB.

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Testing:** Jest

## Installation

### Prerequisites

- Node.js (https://nodejs.org/)
- npm (https://www.npmjs.com/get-npm)

### Steps

1. Clone the repository:
    ```bash
    git clone <repository-url>
    ```

2. Navigate to the project directory:
    ```bash
    cd <project-directory>
    ```

3. Install the dependencies:
    ```bash
    npm install
    ```

4. Start the application:
    ```bash
    npm start
    ```
5. Test the application
 npm test

## Usage

### Creating a Rule

To create a new rule, send a POST request to `/rules/create_rule` with the following JSON body:

```json
{
  "ruleName": "Sample Rule",
  "ruleString": "age >= 18 AND country = 'US'"
}
