---
title: 'Interactive lessons and calculators for undergraduate compressible aerodynamics'
tags:
  - engineering education
  - aerodynamics
  - compressible flow
  - gas dynamics
  - open educational resources
  - interactive lessons
  - generative AI
authors:
  - name: Kursat Kara
    orcid: 0000-0002-2788-0234
    affiliation: 1
affiliations:
  - name: School of Mechanical and Aerospace Engineering, Oklahoma State University, Stillwater, OK, USA
    index: 1
date: 6 November 2026
bibliography: paper.bib
---

# Summary

*MAE 3293 Fundamentals of Aerodynamics: Interactive Lessons* [@Kara2026site] is a computational learning module for the compressible-flow part of a third-year undergraduate aerodynamics course at Oklahoma State University. Its four web lessons and five calculators were converted from the instructor's handwritten lecture notes and follow them, and Anderson's textbook [@Anderson2017], section by section. Quantitative results are computed in the browser from the course's models: a calorically perfect gas, inviscid two-dimensional waves, and quasi-one-dimensional duct flow. Features that these models do not calculate, such as the shape of a detached shock, are drawn schematically and labeled as such. The pages are served from GitHub Pages, the source is maintained on GitHub, and releases are archived on Zenodo; the content is licensed CC BY 4.0 and the code MIT.

# Statement of need

When a supersonic stream is turned, a small change in Mach number or wall angle can change the type of flow: an expansion fan, an attached oblique shock, or a detached shock. Printed tables, hand interpolation, and sketches drawn for one condition make it hard for students to see how a flow responds to its inputs. Several open resources support this subject, including Devenport's calculators and nozzle simulator [@Devenport; @DevenportNozzle], NASA's Beginner's Guide to Aeronautics [@NASAGlenn], and the AeroPython notebooks, which originated in a university course [@BarbaAeroPython; @BarbaMesnard2019]. This module is aligned with the sequence, notation, and worked examples of one course, keeps derivations, interactive figures, and worked examples on the same page, and delivers each page as a single HTML file that runs in a browser without installation.

# Learning objectives and content

Students should be able to (i) decide when a flow must be treated as compressible and apply the isentropic relations; (ii) compute the changes across a normal shock and interpret Pitot-tube measurements; (iii) solve oblique-shock and expansion problems and determine the lift and wave drag of supersonic airfoils; and (iv) predict the flow regime in a converging–diverging nozzle and explain wind-tunnel start-up.

| Chapter | Lesson | Interactive figures | Worked problems |
|:--|:--|:-:|:-:|
| 7 | Compressible flow: preliminary aspects | 3 | 6 |
| 8 | Normal shock waves | 5 | 16 |
| 9 | Oblique shock and expansion waves | 8 | 6 |
| 10 | Nozzles, diffusers and wind tunnels | 5 | 5 |

The calculators evaluate directly the relations tabulated in the textbook's appendices (isentropic flow, normal and oblique shocks, Prandtl–Meyer expansion) and solve supersonic flat-plate, wedge, and diamond airfoils by shock-expansion theory. The oblique-shock calculator shows three ways of finding the shock angle: reading the chart, bisection, and a closed-form solution [@voneggers1998comparison].

# Instructional design

Each interactive figure sits next to the derivation it uses and is designed for a predict–observe–explain sequence [@WhiteGunstone1992], following research on interactive simulations and active learning [@Wieman2008; @Freeman2014]. The diamond-airfoil calculator supports an intended activity of this kind: at $M_\infty = 3$ and half-angle $\varepsilon = 10^\circ$, students predict how the wave on the upper front face changes as the angle of attack $\alpha$ passes $\varepsilon$, sweep $\alpha$ from $0$ to $15^\circ$, and explain the change from a shock to an expansion fan by the local turning angle. Showing each intermediate step, the calculator exercises the reasoning of the hand solution: deciding whether each corner compresses or expands the flow, carrying the local state from face to face, and resolving face pressures into lift, wave drag, and pitching moment, which it then compares with linear theory. In worked examples, a switch places the table-based values from the notes beside the computed ones, and a note explains any difference, such as interpolation or a rounded constant.

# Using and adapting the module

Students need only a web browser; no programming, installation, or account is required. Pages can be opened on the live site, or downloaded and used offline or uploaded to a learning management system. Changing the content requires Git and Node.js: the repository's `README.md` explains how to build the site, and its instructions file, `AGENTS.md`, records the conventions for adding a chapter or calculator.

# Experience of use

The calculators were introduced to students in Fall 2025, and the lessons in class on 30 October 2026; homework that uses them is planned for the rest of the semester. Use has not been tracked, and learning outcomes and usability have not been evaluated. The design draws on the author's teaching of aerodynamics since Fall 2011, at Khalifa University and, since Fall 2019, in this course. In the instructor's experience, reproducing every worked example by computation exposed small inconsistencies in the notes, and showing them openly was preferable to correcting them silently.

# Story of the project

The first calculators were written in 2025 with general-purpose AI chat assistants; that work stalled at the wedge airfoil [@Kara2025calc]. In October 2026 an AI coding agent working in a new repository built the diamond-airfoil calculator, drafted the lessons from the scanned notes, and wrote the build and check tools. The instructor set the requirements, reviewed every change against the notes, and remained responsible for the physics and explanations. Because generated material can be plausible but wrong [@Kasneci2023], scripted checks run on every pull request: selected routines are compared with 41 values from the textbook's tables, the numerical oblique-shock solver with the closed-form solution on 11,200 sampled cases, mass and momentum are checked on computed nozzle flows, and a browser audit [@Playwright] loads every page at desktop and phone widths. Explanatory text is checked only by review.

# AI usage disclosure

ChatGPT (OpenAI) and Gemini (Google) were used in 2025 for the first calculators. Claude Opus 5.5 (Anthropic) was used in 2026 to convert the notes into lessons, update the calculators, write the build and check tools, manage the repository, and draft this paper. ChatGPT and Grammarly were used in editing. The author directed this work, reviewed all content, and takes responsibility for it.

# Acknowledgements

During his service on the AIAA Applied Aerodynamics Technical Committee and its Education Subcommittee from 2012 to 2021, the author benefited from discussions with colleagues about using animations, scripts, and calculators to make aerodynamics more accessible and interactive for students of all ages. He particularly thanks Brian McGrath (Johns Hopkins University Applied Physics Laboratory) for sharing his ideas and collection of publicly available scripts and animations. The author also thanks Sabit Ekin, Director of the Generative AI Literacy Initiative at the Texas A&M Institute of Data Science, for valuable discussions and helpful suggestions. This work received no external funding.

# References
