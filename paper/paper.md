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

*MAE 3293 Fundamentals of Aerodynamics: Interactive Lessons* is a computational learning module for the compressible-flow part of a third-year undergraduate aerodynamics course at Oklahoma State University. Its four web lessons and five calculators were converted from the instructor's handwritten lecture notes and follow the sequence of those notes and of Anderson's textbook [@Anderson2017]. Results are computed in the browser from the course's models (a calorically perfect gas, inviscid two-dimensional waves, quasi-one-dimensional duct flow); features the models do not calculate, such as the shape of a detached shock, are drawn schematically and labeled. The lessons are at <https://kursatkara.github.io/MAE3293_Fundamentals_of_Aerodynamics/> and the source at <https://github.com/kursatkara/MAE3293_Fundamentals_of_Aerodynamics> (content CC BY 4.0, code MIT). This paper describes release v1.1.0 [@Kara2026release]; all releases are archived on Zenodo [@Kara2026site].

# Statement of need

A supersonic stream turned away from itself expands through a fan of Mach waves. Turned into itself, it compresses through an oblique shock, which stays attached only while the turning angle is below a maximum that depends on the Mach number; beyond it, the shock detaches. Printed tables and sketches drawn for one condition make it hard for students to see how these outcomes depend on the inputs. Interactive compressible-flow tools exist, such as Devenport's calculators and nozzle simulator [@Devenport; @DevenportNozzle] and NASA's Beginner's Guide to Aeronautics [@NASAGlenn]. AeroPython, notebooks on potential-flow aerodynamics that originated in a university course [@BarbaAeroPython; @BarbaMesnard2019], is a related example of computational aerodynamics teaching. This module follows one compressible-flow course's sequence, notation, and worked examples, places derivations, figures, and examples on the same page, and delivers each page as a single HTML file that runs in a browser.

# Learning objectives and content

Students should be able to (i) decide when a flow must be treated as compressible and apply the isentropic relations; (ii) compute the changes across a normal shock and interpret Pitot-tube measurements; (iii) solve oblique-shock and expansion problems and determine the lift and wave drag of supersonic airfoils; and (iv) predict the flow regime in a converging–diverging nozzle and explain wind-tunnel start-up.

| Ch. | Lesson | Interactive figures | Worked problems |
|:--|:--|:-:|:-:|
| 7 | Compressible flow: preliminary aspects | 3 | 6 |
| 8 | Normal shock waves | 5 | 16 |
| 9 | Oblique shock and expansion waves | 8 | 6 |
| 10 | Nozzles, diffusers and wind tunnels | 5 | 5 |

: Content of the lessons. Chapter numbers are those of the sixth edition of Anderson's textbook [@Anderson2017].

The isentropic, normal-shock, and Prandtl–Meyer calculators evaluate directly the relations that the textbook tabulates in Appendices A–C. The oblique-shock calculator solves the $\theta$–$\beta$–$M$ relation, which the textbook presents as a chart, and shows three ways of finding the shock angle: reading the chart, bisection, and a closed-form solution [@voneggers1998comparison]. The airfoil calculator applies shock-expansion theory to flat-plate, wedge, and diamond airfoils.

# Instructional design

Each interactive figure sits beside its derivation and is designed for predict–observe–explain [@WhiteGunstone1992], following research on interactive simulations and active learning [@Wieman2008; @Freeman2014]. The diamond-airfoil calculator supports an intended activity of this kind at $M_\infty = 3$ and half-angle $\varepsilon = 10^\circ$. The upper front face turns the flow by $\varepsilon - \alpha$, so as the angle of attack $\alpha$ increases from $0$ to $15^\circ$ its wave changes from a compression shock, to no wave at $\alpha = \varepsilon$, to an expansion fan; students predict this sequence, sweep $\alpha$, and explain it by the local turning angle. They can also see the shock-expansion drag coefficient exceed the linear-theory value by more as the turning angles grow: for $\gamma = 1.4$, by 3% at $\alpha = 0$ and 21% at $15^\circ$. Because each intermediate step is displayed, students can follow the hand solution: which corners compress or expand the flow, how the local state carries from face to face, and how face pressures resolve into lift, wave drag, and pitching moment. In worked examples, a switch places the table-based values from the notes beside the computed ones, and a note explains any difference, such as interpolation or a rounded constant.

# Using and adapting the module

Students need only a JavaScript-enabled web browser; no programming, installation, or account is required. Instructors can link to the pages from a learning management system or distribute them as files that students download and open offline. Rebuilding the site requires Node.js, and the source is managed with Git. `README.md` explains the build, how to report problems, and how to contribute; `AGENTS.md` records the conventions for adding a chapter or calculator.

# Experience of use

The calculators were introduced to students in Fall 2025, and the lessons in class on 30 October 2026; homework that uses them is planned for the rest of the semester. Use has not been tracked, and learning outcomes and usability have not been evaluated. The author has taught aerodynamics since Fall 2011, at Khalifa University and, since Fall 2019, in this course. In his experience, reproducing every worked example by computation exposed small inconsistencies in the notes, and showing them openly was preferable to correcting them silently.

# Story of the project

The first calculators, written in 2025 with general-purpose AI chat assistants, stalled at the wedge airfoil [@Kara2025calc]. In October 2026 an AI coding agent built the diamond-airfoil calculator, drafted the lessons from the scanned notes, and wrote the build and check tools; the instructor set the requirements, reviewed every change against the notes, and remained responsible for the physics and explanations. Because generated material can be plausible but wrong [@Kasneci2023], scripted checks must pass before a change is merged, and since November 2026 they run automatically on every pull request. They compare selected routines with 41 reference values from the textbook and the numerical oblique-shock solver with a closed-form solution in 11,200 sampled cases, check mass and momentum conservation in nozzle flows, and load every page at default inputs at desktop and phone widths [@Playwright]; `README.md` lists the cases and tolerances. They show agreement over sampled conditions, not independent validation of the models; explanatory text is checked only by review.

# AI usage disclosure

ChatGPT (OpenAI) and Gemini (Google) were used in 2025 for the first calculators, and Claude Opus 5.5 (Anthropic) in 2026 to convert the notes into lessons, update the calculators, write the build and check tools, manage the repository, and draft this paper; ChatGPT and Grammarly were used in editing. The author directed this work, reviewed all content, and takes responsibility for it.

# Acknowledgements

The author thanks colleagues on the AIAA Applied Aerodynamics Technical Committee and its Education Subcommittee (2012–2021) for discussions on making aerodynamics more accessible through animations, scripts, and calculators; Brian McGrath (Johns Hopkins University Applied Physics Laboratory) for sharing his ideas and collection of publicly available scripts and animations; and Sabit Ekin (Texas A&M Institute of Data Science) for valuable discussions and helpful suggestions. This work received no external funding.

# References
