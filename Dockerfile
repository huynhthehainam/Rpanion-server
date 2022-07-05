FROM node:16
EXPOSE 5000

WORKDIR /src
RUN apt-get update

RUN apt-get install -y git libgstreamer-plugins-base1.0* libgstreamer1.0-dev libgstrtspserver-1.0-dev gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-plugins-base-apps network-manager python3 python3-dev python3-gst-1.0 python3-pip dnsmasq ninja-build

RUN apt-get purge openresolv dhcpcd5

RUN pip3 install meson
RUN pip3 install netifaces --user
RUN apt-get install -y build-essential
RUN apt-get install -y rsync
# RUN apt-get install -y gcc-9 g++-9

COPY . .
WORKDIR /src/modules/mavlink-router
RUN rm -rf /src/modules/mavlink-router/build
RUN meson setup build . --buildtype=release
RUN ninja -C build
RUN ninja -C build install

WORKDIR /src
RUN chmod 400 pems/*.pem
RUN npm i
RUN npm run build
ENV PORT=5000
ENV HOST=0.0.0.0
CMD [ "npm", "run", "server" ]