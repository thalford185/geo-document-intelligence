# Geo Document Intelligence

Monorepo for a geo-spatial document intelligence application and platform

| 🎥 Recorded Demo | 📘 Application Docs | 📗 Platform Docs |
|---|---|---|
| [Loom Video](https://www.loom.com/share/ec90491ba3b846cea7aca3e65a2d6dbf) | [Application README](application/README.md) | [Platform README](platform/README.md) |

## Purpose
To demonstrate the application of Artificial Intelligence and a Human-in-the-loop interface to the labelling of geospatial data in documents.

## Concepts
#### Document Region
A rectangular portion of a page in a document.

#### Boundary
A geometric representation of an element contained in a geographic map, for example a project site contained within a project plan map.

## Features

### Label a boundary in a document

1. The user inputs the document region containing the map element being labelled. In this case the project site outlined in red. <img width="1512" src="https://github.com/user-attachments/assets/06e872af-ed81-446f-bed0-74744487cf77" />
2. Using the inputted document region, the application suggests the boundary of the map element.<img width="1512" src="https://github.com/user-attachments/assets/69076bc5-1f93-43b5-bccf-5211dbca22b6" />
3. If the suggested boundary is correct, the user completely accepts the suggested boundary. Otherwise the user starts inputting the boundary.
4. Using the inputted partial boundary and document region, the application suggests the remainder of the boundary. <img width="1512" alt="Screenshot 2025-04-28 at 3 12 20 PM" src="https://github.com/user-attachments/assets/1b02de0f-3d9b-4e96-88b8-26c3ddd96019" />
5. The user incrementatlly accepts the suggested boundary where the suggestion is correct and inputs the boundary where the suggestion is incorrect.
6. Steps 4 and 5 are repeated until the boundary has been completely labelled. <img width="1472" alt="Screenshot 2025-04-28 at 3 12 35 PM" src="https://github.com/user-attachments/assets/2a1c83e4-92ed-4c11-9720-7c16af9c2520" />

#### Boundary Prediction AI
The application uses segmentation based boundary prediction to suggest boundaries of map elements. A segmentation based approach was chosen to take advantage of zero-shot promptable segmentation models.

<p align="center"><img height="512" src="https://github.com/user-attachments/assets/ae85a795-ae6f-4a97-94ae-cce81503acef" /></p>

1. Rasterize the page of the document containing the map element.
1. Segment the page raster using [SAM2](https://github.com/facebookresearch/sam2), prompting with the document region bounding box.
3. Filter the segments by minimum size to reduce noise.
4. Convert segment exteriors to geometries by detecting contours.
5. Simplify the geometries to remove redundant vertices.
   
#### Boundary Completion AI

<p align="center"><img height="256" src="https://github.com/user-attachments/assets/f0c28090-b1b7-4b3e-849b-4083e65a850b" /></p>

1. Predict the boundaries in the document region using Boundary Prediction AI.
2. Snap the ends of the inputted partial boundary to the predicted boundaries.
3. Slice the predicted boundaries between the snapped positions.

