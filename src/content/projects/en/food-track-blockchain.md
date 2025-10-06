---
title: "Food Track Blockchain"
description: "A distributed system for transparent traceability of food products using blockchain technology"
date: "2025-03"
lang: "en"
tags: ["gRPC", "C#", "Blockchain", "Microservices", "Protobuf"]
cover: "../images/food-track-blockchain/activity-diagram.png"
url: "https://github.com/LucaKnobel/food-track-blockchain"
---


# Project at a Glance

The project “Food Track Blockchain” focuses on developing a decentralized food inventory management system based on a simplified blockchain architecture. The goal is to store warehouse data from multiple locations in a transparent, verifiable, and tamper-proof manner. The system consists of three core services: a Node Service, which generates and validates new blocks; a Block Queue, which manages blocks in a FIFO sequence; and a Blockchain, which stores and links valid blocks. Each location operates as an independent node that verifies external blocks, while self-generated blocks may not be validated locally. Communication between components is handled via gRPC interfaces defined in a shared library. The project demonstrates, in a prototype form, how a lightweight distributed architecture can ensure transparency and data integrity in interconnected systems.

# Initial Situation

The project was created as part of the "Object-Oriented Programming" specialization in my studies. The goal was to develop a distributed system based on a simplified blockchain architecture. The task specification required designing a system that networks multiple autonomous nodes, which generate and exchange inventory data in the form of blocks.

Each node can independently generate new blocks containing information such as type and quantity of products. These blocks are temporarily stored in a central FIFO queue (First In, First Out). From there, they are examined, validated, and finally permanently adopted into a blockchain by other nodes – comparable to a simplified mining process.

The blockchain is implemented as a linear chain of blocks and can be queried by all nodes to view current inventory data. This structure creates a transparent, traceable, and tamper-proof system for managing inventory across multiple locations.


# Architecture and Structure
## Context Map
The Context Map describes the architecture of the distributed blockchain system for managing inventory. The Context Map illustrates the essential components of the system and their interactions.
The system is divided into three central contexts:
- Blockchain Context: Responsible for storing validated blocks.
- Block Queue Context: Manages a queue according to the FIFO principle (First In, First Out) for newly incoming blocks.
- Node Contexts: Represent individual locations that generate, validate, and transfer blocks into the blockchain.

The individual nodes create blocks with relevant inventory information and send them to the Block Queue. The queue processes incoming blocks in the order of their arrival and forwards them to other nodes for validation. After successful validation, the blocks are entered into the blockchain. Additionally, the nodes have the ability to query the entire blockchain and display the current state of inventory.


![Context Map](../images/food-track-blockchain/context-map.png)

*Context Map*

## Service Structure
The service structure consists of the Node Service for block creation and validation, the Block Queue Service for queue management, and the Blockchain Service for storing validated blocks. This architecture ensures efficient management of inventory. Additionally, the DLL contains the Block class as well as the Proto files used by the respective services.

### Node Service (Console Application)

The Node Service is responsible for creating and validating blocks within the distributed blockchain system. Each node generates new blocks with inventory information and transfers them to the Block Queue. Each node ensures that blocks entered by other nodes are checked and validated before they are finally adopted into the blockchain.
The process follows these steps:

1. A node creates a new block with inventory information and transmits it to the Block Queue Service.
2. At regular intervals, the node retrieves blocks from the queue that do not originate from itself. It makes requests to the Block Queue Service for this purpose.
3. The node validates the data content according to established verification rules.
4. After successful validation, the block is forwarded to the Blockchain Service, where it is finally entered into the blockchain and provided with a hash value.
5. Upon request, the node can retrieve the current version of the blockchain at any time.
Since a node cannot validate its own blocks, verification is performed exclusively by other nodes. This ensures decentralized validation and reduces the risk of manipulation within the system.

### Block Queue Service (gRPC Service)
The Block Queue Service serves as temporary storage for newly generated blocks and operates according to the FIFO principle, so that the oldest blocks are processed first.
The process is as follows:
1. A node submits a block to the Block Queue Service.
2. The Block Queue Service stores the block according to the FIFO principle by appending it to the end of the queue.
3. Upon request from a node, the Block Queue Service extracts the first block from the queue, provided it does not originate from the requesting node.
4. If a block is found, it is returned to the node for validation and removed from the queue. Otherwise, an empty block is returned.

### Blockchain Service (gRPC Service)
The Blockchain Service manages and stores validated blocks.
After successful verification by a node, the block is permanently entered here.
The process follows these steps:
1. A node transmits a validated block to the Blockchain Service.
2. The Blockchain Service stores the block in the linear blockchain list and generates the hash values.
Each node can retrieve and visualize the current blockchain at any time.

### Shared (Dynamic Link Library)
The Shared-DLL includes the Block model as well as two Proto files: one for gRPC communication with the BlockQueue and one for the Blockchain. The Block class deviates slightly from the original specification as it was optimized for gRPC serialization. Additionally, the `NodeId` property was added to assign blocks to their respective locations.

```csharp
// Structure of a Block / partially predefined
using System.Security.Cryptography;
using System.Text;
using ProtoBuf;
using Google.Protobuf.WellKnownTypes;

[ProtoContract]
public class Block
{
    [ProtoMember(1)]
    public int Index { get; set; }

    [ProtoMember(2)]
    public Timestamp TimeStamp { get; set; }

    [ProtoMember(3)]
    public string PreviousHash { get; set; }

    [ProtoMember(4)]
    public string Hash { get; set; }

    [ProtoMember(5)]
    public string Data { get; set; }

    [ProtoMember(6)]
    public string NodeId { get; set; }

    public Block(Timestamp timeStamp, string previousHash, string data, string nodeId)
    {
        Index = 0;
        TimeStamp = timeStamp;
        PreviousHash = previousHash;
        Data = data;
        NodeId = nodeId;
        Hash = CalculateHash(); 
    }

    public string CalculateHash()
    {
        return Convert.ToBase64String(SHA256.Create().ComputeHash(Encoding.ASCII.GetBytes(string.Format("{0}-{1}-{2}-{3}",
        TimeStamp,
        PreviousHash ?? "",
        Data,
        NodeId ?? ""
        ))));
    }
}
```

*Class "Block"*

```protobuf
syntax = "proto3";

package block_chain.v1;

option csharp_namespace = "ProtoBlockchain.Protos.V1";

import "google/protobuf/timestamp.proto";

//Block definition for chain
message ChainBlockGRPC {
  int32 index = 1;
  google.protobuf.Timestamp timestamp = 2;
  string previous_hash = 3;
  string hash = 4;
  string data = 5;
  string node_id = 6;
}

// For empty requests
message Empty {}

// Acknowledgement
message Acknowledgement {
  bool success = 1;
  string message = 2;
}

//RPCs
service BlockchainService {
  rpc AddBlock(ChainBlockGRPC) returns (Acknowledgement);
  rpc GetBlockchain(Empty) returns (stream ChainBlockGRPC);
}
```
*Proto for Blockchain*

```protobuf
syntax = "proto3";

package block_queue.v1;

option csharp_namespace = "ProtoBlockQueue.Protos.V1";

import "google/protobuf/timestamp.proto";

//Block definition for queue
message QueueBlockGRPC {
  google.protobuf.Timestamp timestamp = 1;
  string data = 2;
  string node_id = 3;
}

//Acknowledgement
message Acknowledgement {
  bool success = 1;
  string message = 2;
}

//Node identification
message NodeId {
  string node_id = 1;
}


//RPCs
service BlockQueueService {
  rpc SendBlock(QueueBlockGRPC) returns (Acknowledgement);
  rpc RequestBlock(NodeId) returns (QueueBlockGRPC);
}

```
*Proto for BlockQueue*

## Activity Diagram

This activity diagram illustrates the basic functionality of the system.

![Activity Diagram](../images/food-track-blockchain/activity-diagram.png)

# Algorithms
The following describes the various algorithms in their basic structure. For detailed information, the source code should be consulted.

## Block Creation

When the user selects option 1 in the menu, inventory can be recorded as a block.
The entered data is not immediately validated and can also be `null`. Validation occurs only in a later step by another node.
The entered value is read and stored in the variable `data`. Then the current timestamp is set. After that, an object of the QueueBlockGRPC class is created, which contains the following information:
- Timestamp: The time of block creation.
- Input data: The entered inventory information.
- Node identification: The unique identifier of the node that creates the block.

The node identification is set by the user at the beginning of the application. The QueueBlockGRPC class is automatically generated by the Protocol Buffers Compiler and defined in the corresponding .proto file. The QueueBlockGRPC class was deliberately limited to essential attributes, as hash values are not required within the Block Queue. The Block Queue serves exclusively as temporary storage for new blocks before they are validated and finally entered into the blockchain. Hash value generation occurs only in the BlockchainService, as this is where the final storage and integrity assurance of blocks takes place.

```csharp
...
string? input = Console.ReadLine();
    switch (input)
    {
        case "1":
            {
                ShowInputCreationMessage();
                string? data = Console.ReadLine(); //Data can be null

                //Set Timestamp
                DateTime utcNow = DateTime.UtcNow;
                Timestamp timestamp = Timestamp.FromDateTime(utcNow);

                // Create a new GRPC block with the provided data, data is allowed to be null => will be validated by another node
                QueueBlockGRPC blockGRPC = new()
                {
                    Timestamp = timestamp,
                    Data = data,
                    NodeId = nodeId
                };

                // Initialize the BlockQueueHandler with the service URL
                BlockQueueHandlerService blockQueueHandlerService = new(blockQueueServiceURL);

                // Asynchronously send the block to the BlockQueueService
                await blockQueueHandlerService.SendBlockAsync(blockGRPC);

                Console.WriteLine();
                ShowMenu();
            }
            break;
            ...
            ...
    }
```

*Excerpt: NodeService/Program.cs*

### Test
For the test, the NodeId was set to "Bern" as location identification. Subsequently, option 1 was selected in the menu to record inventory. The entry "Milk, 5000l" was created as a QueueBlockGRPC object and sent to the BlockQueueService.

![Block Creation Test](../images/food-track-blockchain/block-creation-test.png)

*Excerpt: Console output from NodeService, Block Creation Test*

## Entering Block into BlockQueue
After recording the inventory, an object of the BlockQueueHandlerService is created, which is responsible for communication with the BlockQueueService. Subsequently, the block is sent to the Block Queue. 
```csharp
 // Asynchronously send the block to the BlockQueueService
    await blockQueueHandlerService.SendBlockAsync(blockGRPC);
```
*Excerpt: NodeService/Program.cs, Send block to BlockQueue*

The BlockQueue class (registered as Singleton) manages the queue for blocks and enables adding, removing, and selecting blocks for validation. The block is now appended to the BlockQueue list via BlockQueueServiceImpl.

```csharp
// Implementation of the BlockQueueService defined in the gRPC proto file.
public class BlockQueueServiceImpl : BlockQueueService.BlockQueueServiceBase
{

    private readonly BlockQueue _blockQueue;
    public BlockQueueServiceImpl(BlockQueue blockQueue)
    {
        _blockQueue = blockQueue;
    }
    
    
    // Adds a new block to the queue.
    public override Task<Acknowledgement> SendBlock(QueueBlockGRPC requestBlock, ServerCallContext context)
    {
        try
        {   // Add the received block to the queue
            _blockQueue.AddBlock(requestBlock);

            // Return a successful acknowledgment message.
            return Task.FromResult(new Acknowledgement { Success = true, Message = "Block received" });

        }
        catch (Exception ex)
        {
            // If an exception occurs, throw an RpcException with an internal status code and the exception message.
            throw new RpcException(new Status(StatusCode.Internal, $"Interner Serverfehler: {ex.Message}"));
        }
    }
    ...
    ...
}
```

*Excerpt: BlockQueueService/Services/BlockQueueServiceImpl.cs, Block entry into the BlockQueue*

### Test
In the output of the BlockQueueService, it is evident that the block shown in the figure was successfully added to the block queue. In addition, the genesis block was automatically generated by the system and has already been forwarded to a node (in this case, Bern) for validation.

![Test BlockQueue entry](../images/food-track-blockchain/block-in-queue-test.png)

*Excerpt: Console output BlockQueueService, Test BlockQueue entry (3rd line)*


## Block Extraction and Validation
The extraction of a block from the BlockQueue as well as its validation are performed by the BlockValidationService. This is initialized and started as soon as the NodeService has been assigned a NodeId. The entire process runs in a separate asynchronous task, enabling continuous processing of blocks (every second).

```csharp
...

//Start continous block validation on seperate Task
BlockValidationService blockValidationService = new(nodeId, blockQueueServiceURL, blockChainServiceURL);
blockValidationService.Start();

...
```
*Excerpt: NodeService/Program.cs, Start of BlockValidationService*

The BlockValidationService class takes responsibility for extracting a block from the BlockQueue, validating the data, and if the block is deemed valid, transferring it to the blockchain.

```csharp
...
 public void Start()
    {
        Task.Run(async () =>
        {
            while (true)
            {
                try
                {
                    // Request to the BlockQueueService
                    var requestQueueBlock = await _blockQueueHandlerService.RequestBlockAsync(_nodeId);
                    Debug.WriteLine($"Neue Anfrage für Blockvaliderung von {_nodeId}");
                }
                ...
            }
            ...
        }
        ...
    }
    ...
...
```
*Excerpt: NodeService/Services/BlockValidationService.cs, Block request to BlockQueue*


First, the BlockValidationService requests a block from the BlockQueue via an object of the BlockQueueHandlerService. During this process, the current NodeId is transmitted to ensure that a node does not validate its own block. The BlockQueueService then returns the oldest block that does not originate from the requesting node. This procedure ensures compliance with the FIFO principle, provided a valid block is available. Once the block has been successfully transferred, it is removed from the BlockQueue to prevent duplicate processing.

The validation of the block then takes place within the BlockValidationService. The following validation criteria are applied:

- Existence check: The block must not be `null`.
- Data check: The block must contain valid data content.
- Format check: The inventory information must be in the correct format, i.e., values must be separated by commas.



```csharp
...

private bool IsValidRequestBlock(QueueBlockGRPC block)
    {
        if(block == null)
        {
           Debug.WriteLine($"Antwort war null");
           return false;
        }
        
        if (string.IsNullOrWhiteSpace(block.Data))
        {
            Debug.WriteLine($"Keine Daten im Block {block.Timestamp}!");
            return false;
        }

        var parts = block.Data.Split(',');
        if (parts.Length != 2 || parts.Any(string.IsNullOrWhiteSpace))
        {
            Debug.WriteLine($"Daten im Block {block.Timestamp} sind nicht gültig!");
            return false;
        }

        return true;
    }

...
```
*Excerpt: NodeService/Services/BlockValidationService.cs, Block validation*
  
If any of these rules are not met, the block is considered invalid and discarded.
If the block is valid, however, it is transferred to the BlockchainService for further processing, where it is integrated into the existing blockchain. This procedure ensures that only correct and verified blocks are accepted into the blockchain, thereby maintaining data integrity and preventing manipulation.

### Test
In the conducted test, the node "Hamburg" entered a block into the BlockQueue.
This block was subsequently extracted from the BlockQueue by the node "Berlin", validated and processed further.
Furthermore, the node "Berlin" also inserted a block into the BlockQueue.
This block was in turn extracted by the node "Hamburg", validated and processed accordingly. This procedure confirms the correct functionality of the BlockQueue, particularly ensuring that a node cannot validate its own blocks.

![Test der Einlagerung und Auslagerung von Blöcken nach FIFO-Prinzip in der BlockQueue](../images/food-track-blockchain/fifo-queue-test.png)
*Excerpt: Console output BlockQueueService, Test of block storage and extraction according to FIFO principle in the BlockQueue*

## Block Storage in Blockchain
After successful validation, the block is converted from a QueueBlockGRPC to a ChainBlockGRPC. The timestamp, inventory data, and NodeId are transferred in this process. Subsequently, the block is forwarded to the BlockchainService via the BlockchainHandlerService, where the BlockchainHandlerService handles communication between the BlockchainService and the NodeService.

In the BlockchainService, the ChainBlockGRPC is mapped to the Block model of the Blockchain class. First, the last block in the blockchain is retrieved to determine the new index. The index of the new block is increased by one, based on the last entered block. Additionally, the hash of the previous block is set as the PreviousHash of the new block to ensure the chaining of blocks.
After these values have been determined, the hash of the new block is calculated. This is done based on the timestamp, inventory data, NodeId, and the hash value of the previous block. This calculation ensures that each block receives a unique identification and subsequent manipulation can be detected.

After hash calculation, the block is inserted into the blockchain data structure. A console output confirms the successful storage. This procedure ensures that each block is correctly linked to its predecessor and the integrity of the blockchain is maintained.

```csharp
...
// Check whether the received block is valid
if (IsValidRequestBlock(requestQueueBlock))
{
    // Map the Block object from the BlockQueue proto to the Blockchain proto
    var validBlock = new ChainBlockGRPC
    {
        Index = 0, //set in blockchain service
        Timestamp = requestQueueBlock.Timestamp,
        PreviousHash = "placeholder", //set in blockchain service
        Hash = "placeholder", //set in blockchain service
        Data = requestQueueBlock.Data,
        NodeId = requestQueueBlock.NodeId
    };

    // Insert block into blockchain via BlockChainHandler
    var insertBlockInChain = await _blockchainHandlerService.AddBlockAsync(validBlock);
    if (insertBlockInChain.Success)
    {
        Debug.WriteLine($"Blockindex:{validBlock.Index} => {insertBlockInChain.Message}");
    }
    else
    {
        Debug.WriteLine("Fehler beim einfügen des Blocks in Blockchain");
    }
}
...
```
*Excerpt: NodeService/Services/BlockValidationService.cs, Mapping block from QueueBlockGRPC to ChainBlockGRPC*


```csharp
...

 public override Task<Acknowledgement> AddBlock(ChainBlockGRPC request, ServerCallContext context)
    {
        try
        {
            // Create a new block based on the received GRPC-Block
            var newBlock = new Block(
                request.Timestamp,
                request.PreviousHash,
                request.Data,
                request.NodeId
            );

            // Add the new block to the blockchain
            _blockchain.AddBlock(newBlock);

            // Return of a confirmation message
            return Task.FromResult(new Acknowledgement
            {
                Success = true,
                Message = "Block erfolgreich hinzugefügt."
            });
        }

        catch (Exception ex)
        {
            // If an exception occurs, throw an RpcException with an internal status code and the exception message.
            throw new RpcException(new Status(StatusCode.Internal, $"Interner Serverfehler: {ex.Message}"));
        }
    }

...
```
*Excerpt: BlockchainService/Services/BlockChainServiceImpl.cs, Mapping from ChainBlockGRPC to Block model and insertion into Blockchain*


```csharp
...
  public void AddBlock(Block newBlock)
    {
        var latestBlock = GetLatestBlock();
        newBlock.Index = latestBlock.Index + 1;
        newBlock.PreviousHash = latestBlock.Hash;
        newBlock.Hash = newBlock.CalculateHash();
        _chain.Add(newBlock);
        Console.WriteLine($"Index: {newBlock.Index}, Blockeigentümer: {newBlock.NodeId}, Zeitstempel: {newBlock.TimeStamp}, vorheriger Hash: {newBlock.PreviousHash}, Hash: {newBlock.Hash}, Daten: {newBlock.Data}\n");      
    }
...
```
*Excerpt: BlockchainService/Models/Blockchain.cs, Method for inserting a block into the blockchain*

### Test
The conducted test confirms that blocks with indices 2 and 3, which were extracted from the BlockQueue and validated in the test procedure according to the last test, were successfully entered into the blockchain. This shows that the mechanisms for block validation, conversion, and storage in the blockchain function properly.
The correct indexing of blocks within the blockchain also demonstrates that the chaining with previous blocks has been executed flawlessly. This ensures that the blockchain maintains the expected consistency and integrity.

![Test der Blockeinlagerung in die Blockchain](../images/food-track-blockchain/blockchain-test.png)

*Excerpt: Console output BlockchainService, Test of block storage in the blockchain*

## Block Extraction from Blockchain
When the user of the NodeService selects option 2 in the main menu, the complete content of the blockchain is retrieved and displayed. The method `GetBlockchainAsync()` from the BlockchainHandlerService class is called, which establishes a connection to the BlockchainService and requests the stored blocks.
After sending the request, the BlockchainService begins to send the existing blocks as a data stream. These blocks are received sequentially within a loop and stored in a list. Each block is transmitted in ChainBlockGRPC format, which contains the relevant block information such as index, timestamp, previous hash, current hash, data, and NodeId.
After the complete blockchain list has been received, the NodeService outputs the blocks in the console. The output is done block by block, with each block displayed with its most important attributes. This procedure ensures that the node can retrieve a complete and current copy of the blockchain at any time. It also serves to verify whether the blocks are correctly stored and the chaining within the blockchain has remained consistent.

```csharp
...

 case "2":
            {
                BlockchainHandlerService blockchainHandlerService = new(blockChainServiceURL);
                var blockchain = await blockchainHandlerService.GetBlockchainAsync();
                Console.WriteLine("\nAktuelle Blockchain:\n");
                foreach (var block in blockchain)
                {
                    Console.WriteLine($"Index: {block.Index}, Blockeigentümer: {block.NodeId}, Zeitstempel: {block.Timestamp}, vorheriger Hash: {block.PreviousHash}, Hash: {block.Hash}, Daten: {block.Data}\n");   
                }
                Console.WriteLine();
                ShowMenu();
            }
            break;
...
```

*Excerpt: NodeService/Program.cs, Request and output of blockchain via Menu Option 2*

```csharp
...

public override async Task GetBlockchain(Empty request, IServerStreamWriter<ChainBlockGRPC> responseStream, ServerCallContext context)
    {
        try
        {
            // Retrieve the entire blockchain
            var chain = _blockchain.GetBlockchain();

            // stream each block to the node
            foreach (var block in chain)
            {
                var chainBlockGRPC = new ChainBlockGRPC
                {
                    Index = block.Index,
                    Timestamp = block.TimeStamp,
                    PreviousHash = block.PreviousHash,
                    Hash = block.Hash,
                    Data = block.Data,
                    NodeId = block.NodeId
                };

                await responseStream.WriteAsync(chainBlockGRPC);
            }
        }

        catch (Exception ex)
        {
            // If an exception occurs, throw an RpcException with an internal status code and the exception message.
            throw new RpcException(new Status(StatusCode.Internal, $"Interner Serverfehler: {ex.Message}"));
        }
    }
...
```

*Excerpt: BlockchainService/Services/BlockChainServiceImpl.cs, Blockchain stream to Node*

```csharp
...
  // Method for retrieving the entire blockchain
    public async Task<List<ChainBlockGRPC>> GetBlockchainAsync()
    {
        var blocks = new List<ChainBlockGRPC>();
        using (var call = _client.GetBlockchain(new Empty()))
        {
            await foreach (var block in call.ResponseStream.ReadAllAsync())
            {
                blocks.Add(block);
            }
        }
        return blocks;
    }
...
```
*Excerpt: NodeService/Services/BlockChainHandlerService.cs, Filling the block stream into a blockchain list*



### Test
The user has selected option 2 and the complete blockchain at the time of the request is displayed. At the time of the request, the blockchain consisted of the Genesis block of the blockchain, the extracted Genesis block of the BlockQueue, as well as the two blocks from the locations Hamburg and Berlin.

![Test der Blockchain-Auslagerung](../images/food-track-blockchain/blockchain-output-test.png)

*Excerpt: Console output NodeService, Test of blockchain extraction*


# Conclusion

The developed prototype demonstrates a lean, distributed microservices architecture based on C# and gRPC that enables transparent and traceable data processing. Despite initially lacking prior knowledge in gRPC, the construction of efficient communication structures between services could be successfully implemented. Central concepts of object-oriented programming, system integration, and blockchain processing were applied in a practical manner. The project illustrates the ability to learn complex technologies and prototypically realize functional, scalable solutions.