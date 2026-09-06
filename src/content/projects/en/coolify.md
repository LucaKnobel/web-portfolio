---
title: "Self-Hosting with Coolify"
description: "Building and securing a container-based hosting environment on a VPS for personal and educational web projects."
date: "2026-08"
lang: "en"
tags: ["Linux", "Docker", "Coolify", "nftables", "DevOps", "Security"]
cover: "../images/coolify/cover.png"
---

# Project at a Glance

To host personal and educational web projects independently and cost-effectively, I set up my own hosting environment on a Virtual Private Server (VPS) at <a href="https://www.infomaniak.com" target="_blank" rel="noopener noreferrer">Infomaniak</a>.

The project involved more than simply installing a deployment platform. I first configured and secured the underlying Linux server, including SSH hardening and a restrictive firewall using nftables, before setting up Coolify.

<a href="https://coolify.io" target="_blank" rel="noopener noreferrer">Coolify</a> is a self-hosted Platform-as-a-Service for deploying and managing containerized applications, databases, and other services. I use it as a shared hosting and deployment environment for several of my own projects.

# Setup and Operation

The project started with a Linux VPS that I prepared for secure operation. SSH access was hardened, while incoming network traffic was restricted to the required services using an nftables firewall.

I then installed Coolify as the deployment platform. Applications run in containers and are exposed through their own domains or subdomains. This allows me to operate multiple isolated projects on the same infrastructure without requiring a separate hosting environment for each application.

I use the platform for educational, portfolio, and personal projects. This allows me not only to develop applications, but also to manage their deployment and operation myself.

# Security and Infrastructure

When setting up the environment, the focus was on minimizing the attack surface. Administrative access is provided through a hardened SSH configuration, while nftables restricts incoming network traffic to the services that are actually required.

Applications are deployed as Docker containers and managed through Coolify. This means that, in addition to the applications themselves, I also manage key aspects of their operation, including domains and DNS, TLS/HTTPS, reverse proxying, container networking, persistent data, environment variables, and secrets.

Running the applications on my own infrastructure allowed me to gain practical experience not only with application deployment, but also with the underlying Linux, networking, and container infrastructure.

# Key Learnings

The project gave me practical experience operating web applications beyond the local development environment.

One of the most valuable aspects was understanding how Linux administration, network and SSH hardening, Docker, DNS, and the deployment platform interact. This gave me a much clearer understanding of the infrastructure and processes between a developed application or container image and a publicly accessible service.

The infrastructure now serves both as my hosting environment and as a learning platform where I can experiment with new applications, technologies, and deployment approaches.
