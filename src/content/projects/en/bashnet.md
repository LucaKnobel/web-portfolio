---
title: "Semantic Bash Knowledge Management Software"
description: "A knowledge platform that structures complex Bash concepts and makes them accessible via search functions and visualizations."
date: "07/2025"
lang: "en"
tags: ["Python", "UML", "Knowledge Graphs", "Pytest", "CLI"]
cover: "../images/bashnet/cover.png"
url: "https://github.com/LucaKnobel/bashnet-public"
slug: "bashnet"
---

# Semantic Bash Knowledge Management Software

## Project at a Glance

This project presents the development of a prototype knowledge system based on semantic networks. The goal was to create a structured and searchable database that links concepts and enables sustainable knowledge handling. The approach is aligned with recognized standards for knowledge management and quality assurance.

The prototype implements a recursively searchable data structure, initially built as a tree and then extended into a network model. Relationships between nodes are stored with typed relations, enabling versatile queries.

The project combines technical implementation with practical value: it provides a learning-oriented tool for organizing command-line commands and scripting concepts, supports exam preparation as well as day-to-day work, and promotes competency with data-driven methods.

As extensions, a graphical visualization and two different search modes (simple and deep) were designed to demonstrate the system’s capabilities.

## Background and Context

The project is based on an assignment from the Software Engineering area in my HF studies.  
Its focus is the development of a knowledge base built on a semantic network.

The challenge highlights the growing importance of structured knowledge storage in organizations and references requirements from relevant standards (e.g., ISO-9001) for systematic documentation and use of knowledge.

The goal was to develop a functional prototype within a limited time frame that implements core mechanisms of semantic knowledge linking. First, a recursively searchable data structure—implemented as a tree—was built and later extended to a network model. Relationships between concepts were to be typed and stored within the nodes.

Optional extensions included a graphical representation and two search modes (simple and deep).

## Motivation

The motivation stems from relevance to Linux, IT operations, and monitoring—areas that require strong command-line, scripting, and structured knowledge management skills.

A central objective was to design a learning-support tool that provides systematically structured information on command-line commands and related concepts. It should assist both in exam preparation and in professional practice.

The assignment also offered an opportunity to dive deeper into semantic structures, data-driven approaches, and recursive information access.

## Analysis and Design

### Use Case Analysis
The application’s functional requirements were modeled as a use case diagram. Central interaction occurs via a command-line interface (CLI) through which users can search, import, and export semantically stored knowledge.

![Use Case Diagram](../images/bashnet/use-case-diagram.png)

The five core use cases of the CLI-based learning application are described below. They cover the essential interactions between user and system and form the basis for the application’s functionality:

- UC-01 – Search Term (simple): Performs a direct, exact search for a term in the semantic network.  
- UC-02 – Search Term (deep): Extends the search by traversing semantically linked nodes.  
- UC-03 – Import Data: Loads structured knowledge data from JSON files into the network.  
- UC-04 – Visualize Net: Displays the semantic network graphically to reveal relationships.  
- UC-05 – Show Help: Lists all available CLI commands including parameters for the user.

Each use case is described in detail in the tables below.

| **Use Case No.**          | UC-01 |
| ------------------------- | ----- |
| **Name**                  | Search Term (simple) |
| **Actor**                 | CLI user |
| **Preconditions**         | - The semantic network was successfully imported.<br>- The file `knowledge_net.json` exists in the expected directory.<br>- The searched term is present in the network (for positive tests). |
| **Description**           | The user searches for a specific term (e.g., a Bash command) in the semantic network. The system should find exactly this node and output all associated information, including label, type, description, category, tags, examples, and links. |
| **Main Flow**             | 1. The user enters `search <term> --simple`.<br>2. The system checks whether a node with the exact label exists.<br>3. If found, the node is printed with all associated information. |
| **Alternatives**          | **A1: Term not found**<br>a1.1 The system outputs a structured error message. |
| **Acceptance Criteria**   | - The term is found exactly in the network.<br>- Label, type, description, category, tags, examples, and links are output.<br>- For unknown terms, a clear error message is shown. |
| **Test Method**           | Meaningful unit tests with `pytest` verify the underlying logic. CLI output is additionally reviewed manually to validate formatting, content, and clarity. |

| **Use Case No.**          | UC-02 |
| ------------------------- | ----- |
| **Name**                  | Search Term (deep) |
| **Actor**                 | CLI user |
| **Preconditions**         | - The semantic network was successfully imported.<br>- The file `knowledge_net.json` is fully loaded. |
| **Description**           | The user performs a deep search that, besides the searched term, also considers semantically linked nodes via typed relations. Depending on the node type (e.g., `command`, `option`, `concept`, `scripting`), the context is assembled differently. Results are output in a structured way with the target node and related context data. |
| **Main Flow**             | 1. The user enters `search <term>` (without `--simple`).<br>2. The system tries an exact match as in UC-01.<br>3. If found, the node type is checked and processed contextually:<br>• `command` → related `options`<br>• `concept` → linked `commands`, `options`, further concepts<br>• `scripting` → directly related elements<br>• `option` → all `commands` using this option<br>4. The system prints the main node and all context information. |
| **Alternatives**          | **A1: Term not directly found**<br>a1.1 No exact match is found.<br>a1.2 A fallback mechanism is activated.<br>a1.3 Relevant nodes are returned in a ranked order.<br><br>**A2: Term does not exist**<br>a2.1 The system outputs a structured error. |
| **Acceptance Criteria**   | - The target node is correctly identified.<br>- Context is complete and correct depending on node type.<br>- Relations are typed and traceable.<br>- On failure, the fallback returns relevant alternatives with weighting. |
| **Test Method**           | Targeted unit tests with `pytest` verify that deep search works correctly across node types and produces complete context. CLI output is checked manually for completeness, structure, and clarity. |

| **Use Case No.**          | UC-03 |
| ------------------------- | ----- |
| **Name**                  | Import Data |
| **Actor**                 | CLI user |
| **Preconditions**         | - Structured JSON files exist in `data/`.<br>- Files contain valid entries with unique ID, label, and type. |
| **Description**           | The user imports modular JSON files (e.g., `commands.json`, `options.json`) into the semantic network. First, all nodes (commands, options, concepts, etc.) are loaded; then typed relations are created based on `related` and `options` references. The result is stored centrally in `knowledge_net.json`. |
| **Main Flow**             | 1. The user enters `import`.<br>2. The system loads the files (`commands.json`, `concepts.json`, `options.json`, `scripting.json`).<br>3. Nodes are created.<br>4. Relations are added.<br>5. The network is saved to `knowledge_net.json`. |
| **Alternatives**          | **A1: Invalid file or faulty entries**<br>a1.1 The system warns and aborts. |
| **Acceptance Criteria**   | - All valid nodes are imported and saved.<br>- Defined relations (`options`, `related`) are created only if target nodes exist.<br>- `knowledge_net.json` contains a complete network. |
| **Test Method**           | Unit tests with `pytest` ensure nodes and relations are created correctly and `knowledge_net.json` is complete and valid. Manual checks complement the tests. |

| **Use Case No.**          | UC-04 |
| ------------------------- | ----- |
| **Name**                  | Visualize Net |
| **Actor**                 | CLI user |
| **Preconditions**         | - `knowledge_net.json` is complete.<br>- The network was loaded successfully.<br>- The environment allows opening a browser or manual viewing. |
| **Description**           | The user wants to visualize the current semantic network. The system generates an HTML visualization and opens it in the default browser if possible; otherwise, it shows instructions for manual opening. Node types are color-coded and the view is interactive. |
| **Main Flow**             | 1. The user enters `visualize`.<br>2. The system loads `knowledge_net.json`.<br>3. The graph is saved as an HTML file.<br>4. If possible, it is opened directly; otherwise, the user is instructed to open it manually. |
| **Alternatives**          | **A1: Error loading file**<br>a1.1 The system outputs a structured error.<br><br>**A2: Visualization in Docker**<br>a2.1 The system detects Docker mode.<br>a2.2 The HTML file is not auto-opened.<br>a2.3 A hint for manual opening is shown. |
| **Acceptance Criteria**   | - The HTML graph contains all nodes and relations.<br>- Node types are correctly color-coded.<br>- The file opens without errors in a browser.<br>- Errors are communicated clearly. |
| **Test Method**           | Manual visual inspection in the browser (completeness, colors, interactivity, readability). No automated test planned. |

| **Use Case No.**          | UC-05 |
| ------------------------- | ----- |
| **Name**                  | Show Help |
| **Actor**                 | CLI user |
| **Preconditions**         | - The application is installed correctly.<br>- The CLI is launched via a valid entry point. |
| **Description**           | The user opens the integrated help to get an overview of commands and options. Help output appears in the terminal and includes short descriptions for all supported features (import, search, visualize, etc.). |
| **Main Flow**             | 1. The user launches the app or enters `help`.<br>2. The system recognizes the help request.<br>3. An overview of all CLI commands is displayed. |
| **Alternatives**          | **A1: Invalid command**<br>a1.1 The user enters an unknown or misspelled command.<br>a1.2 The system suggests using `help`. |
| **Acceptance Criteria**   | - Help appears immediately and completely.<br>- All main commands are listed with short descriptions.<br>- For invalid inputs, help or a hint is shown. |
| **Test Method**           | Manual testing by invoking `help` and invalid inputs; evaluate completeness and clarity. Automated tests are optional. |

### Activity Diagram: Deep Search
![Activity diagram for the Deep Search process](../images/bashnet/activity-diagram.png)

Deep search is an extended mechanism in the CLI that goes beyond plain term matching and considers semantic relationships in the knowledge network. The figure shows the simplified flow of this functionality as an activity diagram with swimlanes.

The search proceeds in phases:

1. The user starts the search by entering a term **without** the `--simple` flag.  
2. The system performs an initial check via a **simple search**.  
3. If no exact match is found, a **fallback** proposes similar terms based on relevance scoring.  
4. If a match is found, the node’s **type** is determined (e.g., `command`, `concept`, `option`, `scripting`).  
5. Depending on the type, **context nodes** are retrieved:  
   - **command** → linked `options`  
   - **concept** → related `commands`, `options`, further concepts  
   - **scripting** → directly related elements  
   - **option** → all `commands` using the option  
6. The target node and its context are formatted and printed to the **terminal**.

The swimlanes illustrate responsibility across **user**, **application logic**, and the **underlying knowledge graph**. After the command is entered, the process runs without further interaction and returns structured output for continued knowledge work.

## Technical Implementation

### Architecture and Structure
The application is written in **Python (version 3.12+)** using a modular, object-oriented architecture. It follows the **SOLID principles** for maintainability and extensibility.

- **CLI logic** – Manages user interaction via the command line.  
- **Semantic network** – Models knowledge using directed graphs with typed nodes and relations.  
- **Data I/O** – Structured import and export of the knowledge base via JSON files.  
- **Visualization** – Generates an HTML-based network view using *PyVis*.  

The following class diagram shows the main classes, their relationships, and key methods and attributes.

![Class Diagram](../images/bashnet/class-diagram.png)

## Functional Implementation

The key features are encapsulated in separate classes and follow the **single-responsibility principle**. The table summarizes the core responsibilities:

| Class / Component | Description |
|------------------|-------------|
| **BashnetCLI** | Entry point of the application. Coordinates user interaction via the terminal and invokes the appropriate data processing methods. |
| **SemanticNet** | Manages the semantic network data structure. Based on a directed graph; provides methods to insert, link, query, and export nodes and relations. |
| **Node & Edge** | Define the network’s structural elements. `Node` holds metadata for commands, options, or concepts. `Edge` represents typed relations such as `options` or `related`. |
| **JsonIO** | Responsible for JSON import and export. Parses structured input files, creates nodes and edges, and saves the network as `knowledge_net.json`. |
| **Search logic (simple & deep)** | Provides two modes: a flat, direct search and a deeper, context-oriented analysis including traversal of relevant relations. |
| **Visualization** | The `export_html()` method generates a dynamic, interactive HTML network diagram using *PyVis*. |

A central entry point for CLI functionality is located in `cli.py`.  
The following excerpt shows the relevant control flow for command execution and visualization:

```python
import click
import webbrowser
import os
from .cli_core import BashnetCLI
from .utils import print_node_info, print_deep_search_context


def print_help():
    click.secho("Welcome to Bashnet CLI - Your semantic Bash learning tool!
", fg="cyan")
    click.echo("Available commands:")
    click.echo("    import                      => Load all JSON files and rebuild the semantic net")
    click.echo("    search <term>               => Deep search: context-aware with related information")
    click.echo("    search <term> --simple      => Simple search: exact node only")
    click.echo("    visualize                   => Generate and open an interactive HTML graph")
    click.echo("    help                        => Show this help again")
    click.echo("    exit                        => Exit the application")
    click.echo("Press Ctrl+C anytime to exit.\n")


def handle_search(cli: BashnetCLI, term: str, simple: bool):
    cli.load_knowledge_net()

    if simple:
        node = cli.simple_search(term)
        if node:
            print_node_info(node)
        else:
            click.secho(f"Term '{term}' not found.", fg="red")
    else:
        node, context = cli.deep_search(term)
        if node:
            print_node_info(node)
            print_deep_search_context(node, context)
        elif context.get("fallback"): 
            click.secho(f"Term '{term}' not found directly. Showing relevant matches:\n", fg="yellow")
            from .utils import print_context_fallback
            print_context_fallback(context)
        else:
            click.secho(f"Term '{term}' not found.", fg="red")


def main():
    cli = BashnetCLI()
    print_help()

    while True:
        try:
            user_input = input("bashnet> ").strip()
            if not user_input:
                continue
            if user_input.lower() == "exit":
                break

            args = user_input.split()
            cmd = args[0]

            if cmd == "import":
                cli.import_data()

            elif cmd == "search":
                if len(args) < 2:
                    click.secho("Error: Please provide a term to search.", fg="red")
                    continue
                term = args[1]
                simple = "--simple" in args
                handle_search(cli, term, simple)
            
            elif cmd == "visualize":
                try:
                    cli.load_knowledge_net()
                    html_file = "semantic_net.html"
                    cli.net.export_html(html_file)
                    if os.environ.get("RUNNING_IN_DOCKER") != "1":
                        webbrowser.open(html_file)
                    else:
                        print(f"Open this file manually in your host browser: {html_file}")

                except Exception as e:
                    click.secho(f"Error generating visualization: {e}", fg="red")

            elif cmd == "help":
                print_help()

            else:
                click.secho("Unknown command. Type 'help' to see available commands.", fg="yellow")

        except KeyboardInterrupt:
            click.secho("\nGoodbye!", fg="cyan")
            break
        except Exception as e:
            click.secho(f"Error: {e}", fg="red")
```

## Testing and Quality Assurance

### Test Strategy

To ensure functionality and stability, a multi-stage test strategy was implemented:

- **Unit tests**: Validate individual functions and class methods with `pytest`.  
- **Test data checks**: Validate typical entries for all node types (command, option, concept, control structure).  
- **CLI output**: Visual inspection of terminal output to ensure correct formatting and readability.  
- **Error handling**: Simulate invalid terms and structures to validate robust error messages.  

Automated tests are located in `tests/` and are executed with `pytest`.  
A total of **12 unit tests** were written and passed successfully. Manual checks of the CLI behavior complemented the tests.

### Test Cases and Results

#### UC-01 & UC-02 – Search (simple / deep)
**Goal:** Validate exact search (UC-01) and context-sensitive deep search (UC-02).

```python
# Excerpt from test_search.py – UC-01: Simple Search
def test_simple_search_command():
    cli = DummyCLI([sample_command])
    result = cli.simple_search("cd")
    assert result is not None
    assert result["id"] == "cmd_cd"
```

**Expectation:** The term is recognized exactly, and all associated information is printed. For terms like `"nonexistent"`, `None` is returned.

```python
# Excerpt from test_search.py – UC-02: Deep Search
def test_deep_search_option():
    cli = DummyCLI([sample_command, sample_option])
    cli.net.add_edge(Edge("cmd_cd", "opt_a", "options"))
    node, context = cli.deep_search("-a")
    assert node is not None
    assert node["id"] == "opt_a"
    assert "commands" in context
```

**Expectation:** The system identifies the node type and returns context-relevant relations. For unknown terms, a fallback result is provided.

#### UC-03 – Import Data

**Goal:** Verify import of structured JSON files and network creation.

```python
# Excerpt from test_import.py – UC-03: Import Function
def test_import_data_creates_knowledge_net(tmp_path):
    
    ...
    ...

  
    cli.import_data()
    assert os.path.exists(cli.knowledge_file)
    assert cli.net.has_node("cmd_echo")
    assert cli.net.has_node("opt_n")
    assert any(
        source == "cmd_echo" and target == "opt_n" and relation == "related"
        for source, target, relation in cli.net.graph.edges.data("relation")
    )
```

**Expectation:** The file `knowledge_net.json` is created; all valid nodes and relations are imported and saved correctly.

#### Additional CLI Screenshots

To validate visual output, key functions were also tested manually and documented as screenshots. They show how the application responds to typical commands:

![CLI output for `search ls --simple` (UC-01)](../images/bashnet/test-output-search-simple.png)

*CLI output for `search ls --simple` (UC-01)*

![CLI output for `search ls` with context (UC-02)](../images/bashnet/test-output-search-deep.png)

*CLI output for `search ls` with context (UC-02)*

![Excerpt of the visualized graph in the browser via `visualize` (UC-04)](../images/bashnet/test-output-visualize.png)

*Excerpt of the visualized graph in the browser via `visualize` (UC-04)*

![Output of the `help` command (UC-05)](../images/bashnet/test-output-help.png)

*Output of the `help` command (UC-05)*

## Results and Reflection

### Goal Achievement
The core project goals were met. The semantic network was successfully implemented with a modular data structure. The implemented search modes (simple and deep) enable targeted queries, and network persistence was realized via a JSON file. In addition, an interactive *PyVis* visualization provides an intuitive view of the network.

### Reflection and Learnings
Key learnings from the project:

- **Graph and network analysis**: Building and managing directed graphs with `networkx`.  
- **Software architecture**: Applying SOLID principles, encapsulating functionality, and designing testable modules.  
- **Test strategy**: Using `pytest`, writing unit tests, and building dummy data for robust error handling.  
- **CLI design**: Designing a user-friendly command-line app with clear commands and readable output.  
- **Documentation**: Systematic write-ups with tables, listings, screenshots, and diagrams.  

These aspects strengthened my skills in **Python development, structured knowledge modeling, and software quality**.

### Future Work
Promising directions:

- **Scaling**: Introduce indexing or advanced search algorithms for performance.  
- **User interface**: Add a graphical web UI (e.g., Flask) for broader accessibility.  
- **Interactive expansion**: Add new nodes directly via CLI or web UI.  
- **NLP integration**: Use natural language processing to make queries more natural.  

**Conclusion:**  
The project demonstrates how a theoretical assignment can become a functional prototype with a clear architecture and practical applicability. In particular, working with semantic structures and a test-oriented approach measurably expanded my software development skills.