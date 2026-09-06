---
title: "Food Track Blockchain"
description: "A distributed system for transparent food inventory management based on a simplified blockchain architecture."
date: "2025-03"
lang: "en"
tags: ["gRPC", "C#", "Blockchain", "Microservices", "Protobuf"]
cover: "../images/food-track-blockchain/activity-diagram.png"
url: "https://github.com/LucaKnobel/food-track-blockchain"
---

# Project at a Glance

Food Track Blockchain was developed as part of the Object-Oriented Programming specialization in my Advanced Federal Diploma studies in Computer Science. The goal was to develop a distributed system that connects multiple autonomous nodes and stores inventory data in a traceable manner using a simplified blockchain architecture.

Each location is represented by its own node and can create new blocks containing inventory information. These blocks are first stored in a central FIFO queue and subsequently validated by another node. Nodes are not allowed to validate their own blocks. Successfully validated blocks are permanently added to the blockchain and linked to their respective predecessors.

The project was implemented in C#. Communication between the individual services is handled using gRPC and Protocol Buffers.

# Technical Implementation

The system consists of three main components: the Node Service, the Block Queue, and the Blockchain Service. Individual nodes create new blocks, validate blocks created by other nodes, and can retrieve the current state of the blockchain. The Block Queue coordinates blocks awaiting validation according to the FIFO principle, while the Blockchain Service is responsible for permanently storing and linking validated blocks.

![Context Map](../images/food-track-blockchain/context-map.png)

Communication between the services was implemented using gRPC interfaces. The corresponding messages and service contracts are defined with Protocol Buffers and shared between the participating components. This explicitly defines the interfaces between the services and allows the required client and server types to be generated from the Protobuf definitions.

During processing, a new block is initially transferred to the Block Queue without its final hash. Another node retrieves the block, validates its contents, and, if validation succeeds, forwards it to the Blockchain Service. The service then determines the index, the hash of the previous block, and the block's own hash before adding it to the existing chain.

# Quality Assurance

The system's functionality was verified based on its core workflows. This included creating and queuing new blocks, FIFO processing, validation by different nodes, and the subsequent addition of valid blocks to the blockchain.

Additional checks ensured that a node could not validate blocks it had created itself and that stored blocks were correctly linked to their respective predecessors.

# Key Learnings

The project gave me practical experience in developing distributed applications, particularly in communication between separate services. I worked with gRPC and Protocol Buffers for the first time and implemented the defined service interfaces in C#.

A particularly interesting aspect was the interaction between the individual components: data is not processed within a single process but passes through multiple services with distinct responsibilities. This gave me practical experience with service boundaries, asynchronous processing, and the coordination of distributed components.

At the same time, I explored fundamental blockchain concepts, particularly the linking of blocks using cryptographic hashes and validation by other participants in the system.

# Detailed Documentation

A comprehensive German-language documentation is available for this project, including further details on its design, architecture, implementation, and verification, as well as additional diagrams and code examples.

If you are interested, I would be happy to provide the complete documentation upon request. Please contact me via the [contact form](/en/contact).
