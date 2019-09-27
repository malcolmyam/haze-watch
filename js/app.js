"use strict";
/** 
 * Simple haze app checker 
 * 
 */
$(document).ready(function () {


    const PSI_URL = "https://api.data.gov.sg/v1/environment/psi";
    const PM25_URL = "https://api.data.gov.sg/v1/environment/pm25";
    const INTERVAL_FREQ = 1000 * 60;
    let query_date_time = "2019-09-25T11:00:00+08:00"; //2019-09-25T11:00:00+08:00
    let query_date = "";
    let location_arr = ["north", "south", "east", "west", "central"];
    let os
    let currentLocation = "west";

    let psi_index = ["pm25_one_hourly", "pm10_sub_index", "so2_sub_index", "co_eight_hour_max", "o3_sub_index", "no2_one_hour_max"];
    let pm25_one_hourly = 0;
    let pm10_sub_index = 0;
    let so2_sub_index = 0;
    let co_eight_hour_max = 0;
    let o3_sub_index = 0;
    let no2_one_hour_max = 0;

    //decide on the current mode of psi setting
    let current_mode_arr = ["hourly_psi","pm25","twenty_four_hourly_psi"]
    let current_mode = "";

    let psiIndexCategory = [{
            psi: 0,
            pm25: 0,
            pm10: 0,
            so: 0,
            co: 0,
            o: 0,
            no: 0,
            status: "healthy"
        },
        {
            psi: 50,
            pm25: 12,
            pm10: 50,
            so: 80,
            co: 5,
            o: 118,
            no: 0,
            status: "moderate"
        },
        {
            psi: 100,
            pm25: 55,
            pm10: 150,
            so: 365,
            co: 10,
            o: 157,
            no: 0,
            status: "unhealthy"
        },
        {
            psi: 200,
            pm25: 150,
            pm10: 350,
            so: 800,
            co: 17,
            o: 235,
            no: 1130,
            status: "Very Unhealthy"
        },
        {
            psi: 300,
            pm25: 250,
            pm10: 420,
            so: 1600,
            co: 34,
            o: 785,
            no: 2260,
            status: "Hazardous"
        },
        {
            psi: 400,
            pm25: 350,
            pm10: 500,
            so: 2100,
            co: 46,
            o: 980,
            no: 3000
        },
        {
            psi: 500,
            pm25: 500,
            pm10: 600,
            so: 2620,
            co: 57.5,
            o: 1180,
            no: 3750,
            status: "Hazardous"
        }
    ];

    let getPSI = $.ajax({
            url: PSI_URL,
            type: "GET",
            dataType: "json",
            data: {
                "date_time": query_date_time
            }
        })
        .done(function (msg) {

            // let obj = JSON.parse(msg);
            console.log("API Status: " + msg.api_info.status);
            let readings = msg.items[0].readings;

            $("#psi-north").html(styleReading(readings.psi_twenty_four_hourly.north));
            $("#psi-south").html(styleReading(readings.psi_twenty_four_hourly.south));
            $("#psi-east").html(styleReading(readings.psi_twenty_four_hourly.east));
            $("#psi-west").html(styleReading(readings.psi_twenty_four_hourly.west));
            $("#psi-central").html(styleReading(readings.psi_twenty_four_hourly.central));


            $("#psi-main-current").html(readings.psi_twenty_four_hourly[$("#psi-main-current").data("psi-main-current")]);

            //inject current sub style background color
            $("div[data-psi-region!='" + current +"']").removeClass("psi-current rounded");
            $("div[data-psi-region!='" + current +"'] .psi-side-heading").removeClass("psi-side-heading");
            //toggle style for sidebar
            var current = $("#psi-main-current").data("psi-main-current");
            $("div[data-psi-region='" + current +"']").addClass("psi-current rounded"); 
            $("div[data-psi-region='" + current +"'] .psi-region-text").addClass("psi-side-heading"); 

            $(".main-bg").css("background-color",getHex(readings.psi_twenty_four_hourly[current]));

            pm10_sub_index = readings.pm10_sub_index.north;
            so2_sub_index = readings.so2_sub_index.north;
            co_eight_hour_max = readings.co_eight_hour_max.north;
            o3_sub_index = readings.o3_sub_index.north;
            no2_one_hour_max = readings.no2_one_hour_max.north;

        })
        .fail(function (xhr, text) {
            var errorMessage = xhr.status + ': ' + xhr.statusText
            console.log('Error - ' + errorMessage);
        });

    //retrieve 1hr PM25 values
    let getPM25 = $.ajax({
            url: PM25_URL,
            type: "GET",
            dataType: "json",
            data: {
                "date_time": query_date_time
            }
        })
        .done(function (msg) {

            // let obj = JSON.parse(msg);
            console.log(msg.api_info.status);

            pm25_one_hourly = msg.items[0].readings.pm25_one_hourly.north;
            console.log("PM25 one Hourly: " + pm25_one_hourly);
            console.log("estimated 1hr PSI based on PM25: " + calHourPSI(40, "pm25"));
            console.log("Estimate 1hr PSI " + calEstimatedHourPSI(pm25_one_hourly, pm10_sub_index, so2_sub_index, co_eight_hour_max, o3_sub_index, no2_one_hour_max));

        })
        .fail(function (xhr, text) {
            var errorMessage = xhr.status + ': ' + xhr.statusText
            console.log('Error - ' + errorMessage);
        });


    //update date UI 
    $(function () {
        updateTimeDisplay();
    });



    function getPSIReadings(query_timestamp){

        let psiReadings;
        let getPSI = $.ajax({
            url: PSI_URL,
            type: "GET",
            dataType: "json",
            data: {
                "date_time": query_date_time
            }
        })
        .done(function (msg) {
            console.log("calling pm25 within..: " + msg.api_info.status);
            psiReadings = msg.items[0].readings;
            let getPM25 = $.ajax({
                url: PM25_URL,
                type: "GET",
                dataType: "json",
                data: {
                    "date_time": query_date_time
                }
            })

            //start calculating PSI hourly based on PM25
            .done(function (pm25) {
                console.log("processing pm25");
                var psiHourlyReadings = [];
                var psiHourly = pm25.items[0].readings;

                for(var i = 0; i < location_arr.length; i++){
                    psiHourlyReadings[location_arr[i]] = calEstimatedHourPSI(
                        psiHourly.pm25_one_hourly[location_arr[i]],
                        psiReadings.pm10_sub_index[location_arr[i]],
                        psiReadings.so2_sub_index[location_arr[i]],
                        psiReadings.co_eight_hour_max[location_arr[i]],
                        psiReadings.o3_sub_index[location_arr[i]],
                        psiReadings.no2_one_hour_max[location_arr[i]],
                        ); 
                    console.log("Location" + location_arr[i] + "Cal estimated.. " + calEstimatedHourPSI(
                        psiHourly.pm25_one_hourly[location_arr[i]],
                        psiReadings.pm10_sub_index[location_arr[i]],
                        psiReadings.so2_sub_index[location_arr[i]],
                        psiReadings.co_eight_hour_max[location_arr[i]],
                        psiReadings.o3_sub_index[location_arr[i]],
                        psiReadings.no2_one_hour_max[location_arr[i]],
                        ));
                }
                console.log("PSI Location Central " + psiHourlyReadings["central"]);
               
               
               updatePSIReadings(psiHourlyReadings);
               //readings.psi_twenty_four_hourly[$("#psi-main-current").data("psi-main-current")
               toggleMainPSI(psiHourlyReadings[$("#psi-main-current").data("psi-main-current")]);
                /*
                pm10_sub_index = readings.pm10_sub_index.north;
                so2_sub_index = readings.so2_sub_index.north;
                co_eight_hour_max = readings.co_eight_hour_max.north;
                o3_sub_index = readings.o3_sub_index.north;
                no2_one_hour_max = readings.no2_one_hour_max.north;
                */
                
               // console.log("Estimate 1hr PSI " + calEstimatedHourPSI(pm25_one_hourly, pm10_sub_index, so2_sub_index, co_eight_hour_max, o3_sub_index, no2_one_hour_max));
    
                //update all with PM25
    
            })
            .fail(function (xhr, text) {
                var errorMessage = xhr.status + ': ' + xhr.statusText
                console.log('Error - ' + errorMessage);
            });
        })
        .fail(function (xhr, text) {
            var errorMessage = xhr.status + ': ' + xhr.statusText
            console.log('Error - ' + errorMessage);
        });
    }

    function getPSIHourly(){

        
        let getPM25 = $.ajax({
            url: PM25_URL,
            type: "GET",
            dataType: "json",
            data: {
                "date_time": query_date_time
            }
        })
        .done(function (msg) {
            var pm25Hourly = [];


            pm25_one_hourly = msg.items[0].readings.pm25_one_hourly.north;
            console.log("PM25 one Hourly: " + pm25_one_hourly);
            console.log("estimated 1hr PSI based on PM25: " + calHourPSI(40, "pm25"));
            console.log("Estimate 1hr PSI " + calEstimatedHourPSI(pm25_one_hourly, pm10_sub_index, so2_sub_index, co_eight_hour_max, o3_sub_index, no2_one_hour_max));

            //update all with PM25

        })
        .fail(function (xhr, text) {
            var errorMessage = xhr.status + ': ' + xhr.statusText
            console.log('Error - ' + errorMessage);
        });
    }

    function getHex(psi){
        if(psi <  51){
            return "#06960F";
        }else if (psi < 101){
            return "#076FA5";
        }else if (psi < 201){
            return "#F8D200";
        }else if(psi < 301){
            return "#FFBF00";
        }else{
            return "#FF0000";
        }
    }

    /**
     * Updates the main content reading for current region
     */
    function toggleMainPSI(reading){
        $("#psi-main-current").html(reading);

        //inject current sub style background color
        $("div[data-psi-region!='" + current +"']").removeClass("psi-current rounded");
        $("div[data-psi-region!='" + current +"'] .psi-side-heading").removeClass("psi-side-heading");
        //toggle style for sidebar
        var current = $("#psi-main-current").data("psi-main-current");
        $("div[data-psi-region='" + current +"']").addClass("psi-current rounded"); 
        $("div[data-psi-region='" + current +"'] .psi-region-text").addClass("psi-side-heading"); 
    }
    //todo: modify main text shadow to suit the current status
    function getPSIShadow(psi){
        
    }

    function updateTimeDisplay() {
        let now = new Date();
        let h = now.getHours();
        let m = now.getMinutes();
        let dd = now.getDate();
        let mm = now.getMonth() + 1;
        let y = now.getYear();
        let time = h + ':' + m + "on " + dd + " " + mm + " " + y;
        $("#date-time").html(now.toString());
    }

    //return color code
    function processPSI(psiIndex) {
        let status = "NA";
        if (psiIndex <= 50) {
            status = "Good";
        } else if (psiIndex >= 51 && psiIndex <= 100) {
            status = "Moderate";
        } else if (psiIndex >= 101 && psiIndex <= 200) {
            status = "Unhealty";
        } else if (psiIndex >= 201 && psiIndex <= 300) {
            status = "Very Unhealthy";
        } else if (psiIndex > 300) {
            status = "Hazardous";
        }

        return status;
    }


    function processPM25(pm25) {
        if (pm25 <= 12) {
            status = "Good";
        } else if (pm25 <= 55) {
            status = "moderate";
        } else if (pm25 <= 150) {
            status = "unhealthy";
        } else if (pm25 <= 250) {
            status = "Very Unhealthy";
        } else {
            status = "Hazardous";
        }

    }

    function styleReading(reading){
        return "<span style='color:" + getHex(reading)
        + " '> " + reading 
       // + getStatus(reading)
        + "</span>";
    }

    function updateTime() {
        interval = setInterval(updateTimeDisplay, INTERVAL_FREQ);
    }

    //refresh all UI related to Readings
    function updatePSIReadings(currentReadings){
        for(var i = 0; i < location_arr.length; i++){
           $("#psi-" + location_arr[i]).html(styleReading(currentReadings[location_arr[i]]));
        }
    }
    /*
     * Compute Hourly PSI based on category values values 
     * Special case for category no, readings are ignore if below 1130
     */
    function calHourPSI(reading, category) {
        var psi = 0;
        if (category == "no" && reading < 1130)
            return 0;

        for (var i = 1; i < psiIndexCategory.length; i++) {
            if (reading <= psiIndexCategory[i][category]) {
                psi = Math.round((psiIndexCategory[i].psi - psiIndexCategory[i - 1].psi) / (psiIndexCategory[i][category] - psiIndexCategory[i - 1][category]) * (reading - psiIndexCategory[i - 1][category]) + psiIndexCategory[i - 1].psi);
                console.log("reading: " + reading + " category: " + category + "psi" + psi);
                return psi;
            }
        }
        return 0;
    }

    function calEstimatedHourPSI(pm25, pm10, so, co, o, no) {

        return Math.max(
            calHourPSI(pm25, "pm25"),
            calHourPSI(pm10, "pm10"),
            calHourPSI(so, "so"),
            calHourPSI(co, "co"),
            calHourPSI(o, "o"),
            calHourPSI(no, "no"),
        );
    }

    function getStatus(reading, indexCategory){
        for (var i = 0 ; i  < psiIndexCategory.length; i++){
            if(reading <= psiIndexCategory[i]["psi"]){
                return psiIndexCategory[i-1]["status"];
            }
        }   
        return "NA";
    }

    $('#btn-pm25').click(function (e) {
        e.preventDefault();
        console.log("pm25 clickced");
    });

    $('#btn-hourly-psi').click(function (e) {
        e.preventDefault();

        getPSIReadings("");

    });

});