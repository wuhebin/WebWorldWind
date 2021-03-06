define([''], function(ww) {


    function Cylinder(color, center, radius, height) {

        var earthRadiusInfo = {
            earthRadiusInKm : 6317,
            earthRadiusInM : 6317 * 1000,
        }

        this.initialHeight = height;

        var EarthToCartesian = function (longitude, latitude) {
            var R  = earthRadiusInfo.earthRadiusInKm;
            var x = R * Math.cos(latitude) * Math.cos(longitude);
            var y = R * Math.cos(latitude) * Math.sin(longitude);
            var z = R * Math.sin(latitude);
            return {
                x : x,
                y : y,
                z : z
            };
        };

        var CartesianToEarth = function (x, y, z) {
            var R = earthRadiusInfo.earthRadiusInKm;
            var lat = Math.asin(z /  R);
            var long = Math.atan2(x, y);
            return new WorldWind.Location(lat, long);
        };

        this.color = color;
        this.center = center;
        this.radius = radius;
        this.height = height;


        var coordinates = EarthToCartesian(center.longitude, center.latitude);

        function getXCoordinate(angle) {
            return center.longitude + radius * Math.sin(angle);
        }

        function getYCoordinate(angle) {
            return center.latitude + radius * Math.cos(angle);
        }

        var numPoints = 3;

        var angles = [];

        var fullCircle = 2 * Math.PI;

        var step = fullCircle / numPoints;

        var start = 0;

        for(var idx = 0; idx < numPoints; idx++) {
            angles.push(start);
            start += step;
        }

        var locations = angles.map(function(angle) {
            var x = getXCoordinate(angle);
            var y = getYCoordinate(angle);
            return [x, y];
        });





        var positions = locations.map(function(location) {
            var loc = CartesianToEarth(location[0], location[1], coordinates.z)
            var lat = location[1];
            var long = location[0];
            return new WorldWind.Position(lat, long, height);
        });

        var boundaries = [positions, []];

        for(var idx = 0; idx < positions.length; idx += 1) {
            boundaries[1].push(new WorldWind.Position(center.latitude, center.longitude, height));
        }



        var cylinderAttribute = new WorldWind.ShapeAttributes(null);
        cylinderAttribute.interiorColor = color;
        cylinderAttribute.outlineColor = color;
        cylinderAttribute.drawInterior = true;
        cylinderAttribute.drawVerticals = true;

        //this.enabled = true;

        this.cylinder = new WorldWind.Polygon(boundaries);
        this.cylinder.attributes = cylinderAttribute;
        this.cylinder.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
        this.cylinder.extrude = true;

        this.cylinder.eyeDistanceScalingThreshold = 1e5;

        this.cylinder.enabled = true;
        //this.highlighted = this.cylinder.highlighted;
            //var cylinderRender = cylinder.render;

        function flatten(arr) {
            var ans = [].concat.apply([], arr);
            return ans;
        }



        this.render = function(dc) {
            var cylinderBoundaries = flatten(this.cylinder._boundaries);
            var someBoundary = cylinderBoundaries[0];
            var currHeight = someBoundary;
            //console.log(currHeight);
            var eyeDistance = Math.abs(dc.eyePosition.altitude - currHeight.altitude);

            //console.log(eyeDistance);
            var visibilityScale = (eyeDistance / this.cylinder.eyeDistanceScalingThreshold);
                //Math.max(0.0, Math.min(1, this.cylinder.eyeDistanceScalingThreshold /
                //eyeDistance));

            //if(true) {
            //    cylinderBoundaries.forEach(function (boundary) {
            //        var temp = visibilityScale * height;
            //        boundary.altitude = Math.min(height, temp);
            //    });
            //}


            //if(Math.floor(visibilityScale) < 1) {
            //    //console.log('rendering at ', visibilityScale);
            //    cylinderBoundaries.forEach(function (boundary) {
            //    //    console.log('visible ', visibilityScale);
            //    //    console.log('scalling down to ', visibilityScale * height);
            //        boundary.altitude = visibilityScale * height;
            //    });
            //}

            //console.log(this.cylinder.eyeDistanceScalingThreshold);
            //cylinderBoundaries.forEach(function(boundary) {
            //    boundary.altitude = visibilityScale * boundary.altitude;
            //});
            //if(Math.floor(visibilityScale) <= 1) {
            //    console.log('rendering at ', visibilityScale);
            //    cylinderBoundaries.forEach(function (boundary) {
            //        boundary.altitude = visibilityScale * this.initialHeight;
            //    });
            //}
            //} else {
            //    cylinderBoundaries.forEach(function(boundary) {
            //       boundary.altitude = this.initialHeight;
            //    });
            //}

            this.cylinder.render(dc);

        }




    }

    Object.defineProperties(Cylinder.prototype, {
        highlighted: {
            get: function() {
                return this.cylinder.highlighted;
            },

            set: function(value) {
                this.cylinder.highlighted = value;
            }
        },

        enabled: {
            get: function() {
                return this.cylinder.enabled;
            },

            set: function(value) {
                this.cylinder.enabled = value;
            }
        }
    })


    return Cylinder;

});
