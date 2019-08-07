FROM osgeo/gdal:alpine-normal-v2.4.1 AS mbtilebuilder

# See https://github.com/UrbanSystemsLab/raster-to-mbtiles#2-gdal_translate

RUN apk add --no-cache curl

RUN mkdir /build && curl -L -o /build/floorplan_v5.tif "https://drive.google.com/uc?export=download&id=16nNCcRJZEXJA9cYphWiFdKMI3OvY0078"

WORKDIR /build

# This is the actual GeoTIFF -> mbtiles conversion
RUN gdal_translate -of MBTILES -co BLOCKSIZE=2048 -co ZOOM_LEVEL_STRATEGY=UPPER floorplan_v5.tif floorplan_v5.mbtiles

# Add different zoom levels.
# TODO: minimum zoom level is 16, how do we add smaller zoom levels?
RUN gdaladdo -r average floorplan_v5.mbtiles 2 4 8 16 32

FROM klokantech/tileserver-gl:latest

# See this repo for instructions for generating the .mbtiles file https://github.com/openmaptiles/openmaptiles#build
RUN mkdir /server && curl -L -o /server/helsinki.mbtiles "https://drive.google.com/uc?export=download&id=14CSgceZROQ2sg7RYuz9m74iDZ19-UdrE"

WORKDIR /fontbuild
RUN git clone https://github.com/openmaptiles/fonts.git
WORKDIR /fontbuild/fonts
RUN npm i
RUN node ./generate.js
RUN cp -r _output /server/fonts

COPY opts.json /server/opts.json
COPY --from=mbtilebuilder /build/floorplan_v5.mbtiles /server

CMD ["/bin/bash", "/usr/src/app/run.sh", "--config", "/server/opts.json"]