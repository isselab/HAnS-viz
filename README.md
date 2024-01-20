# HAnS-Viz

![Build](https://github.com/isselab/HAnS-viz/workflows/Build/badge.svg)
[![Version](https://img.shields.io/jetbrains/plugin/v/PLUGIN_ID.svg)](https://plugins.jetbrains.com/plugin/PLUGIN_ID)
[![Downloads](https://img.shields.io/jetbrains/plugin/d/PLUGIN_ID.svg)](https://plugins.jetbrains.com/plugin/PLUGIN_ID)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

<!-- Plugin description -->
HAnS-Viz is a plugin that aims to help developers with visualizing features that are created by HAnS.
See also: [HAnS Plugin](https://plugins.jetbrains.com/plugin/22759)

The visualisations are based on metrics provided by HAnS that also can be shown as
- [Tree View](https://github.com/isselab/HAnS-viz/assets/79728213/396c24d9-d090-437b-b1e1-f8c3dd71fce5)
- [Tree Map](https://github.com/isselab/HAnS-viz/assets/79728213/855fd803-5d48-4181-b501-296a9aa83972)
- [Tangling View circular](https://github.com/isselab/HAnS-viz/assets/79728213/658733f5-fd7d-4368-b466-21daeacd73f9)
- [Tangling View non-circular](https://github.com/isselab/HAnS-viz/assets/79728213/e0242ae4-3108-46b0-a2a0-d384040491a5)




HAnS-Viz also provides a [Feature Info Window](https://github.com/isselab/HAnS-viz/assets/79728213/a2e01eed-4f1b-4fa1-bc65-1d8df93aa13c)
 on the lower left side to provide insight into various feature-specific information, such as
- Tangling Degree
- Scattering Degree
- Locations of annotated software assets

The Feature Info Window also allows to navigate to files or lines of code annotated by a specific feature by clicking on one of the entries under "Locations" or by clicking on them in the [Scattering chart](https://github.com/isselab/HAnS-viz/assets/79728213/64268e0e-58b7-44c5-9996-abf4c9d6b98d)
.

The width of the edges between the nodes within the Scattering chart indicates the proportion of lines annotated in the given feature file in relation to the total lines annotated by the feature. This is also determined by the "Feature coverage" property

<!-- Plugin description end -->
## Installation
Since HAnS-Viz is dependent on HAnS, it is necessary to install HAnS. For further information see:
[HAnS Plugin on GitHub](https://github.com/isselab/HAnS)

1. Clone/Download this repository 
2. Go to main folder 
3. Build JAR with gradle-task "buildPlugin" 
4. Install it manually using
  <kbd>Settings/Preferences</kbd> > <kbd>Plugins</kbd> > <kbd>⚙️</kbd> > <kbd>Install plugin from disk...</kbd>

#### Research group
[![jhc github](https://img.shields.io/badge/GitHub-isselab-181717.svg?style=flat&logo=github)](https://www.github.com/isselab)
[![](https://img.shields.io/website.svg?down_color=red&down_message=down&up_color=green&up_message=isselab.org&url=http%3A%2F%2Fshields.io)](https://www.isselab.org)
#### Chair of Software Engineering
[![Chair of Software Engineering](https://img.shields.io/website.svg?down_color=red&down_message=down&up_color=green&up_message=se.ruhr-uni-bochum.de&url=http%3A%2F%2Fshields.io)](http://se.rub.de)

### [Contributors](CONTRIBUTORS.md)
