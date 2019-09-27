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
            $("div[data-psi-region!='" + current + "']").removeClass("psi-current rounded");
            $("div[data-psi-region!='" + current + "'] .psi-side-heading").removeClass("psi-side-heading");
            //toggle style for sidebar
            var current = $("#psi-main-current").data("psi-main-current");
            $("div[data-psi-region='" + current + "']").addClass("psi-current rounded");
            $("div[data-psi-region='" + current + "'] .psi-region-text").addClass("psi-side-heading");

            $(".main-bg").css("background-color", getHex(readings.psi_twenty_four_hourly[current]));

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


    function getHex(psi) {
        if (psi < 51) {
            return "#06960F";
        } else if (psi < 101) {
            return "#076FA5";
        } else if (psi < 201) {
            return "#F8D200";
        } else if (psi < 301) {
            return "#FFBF00";
        } else {
            return "#FF0000";
        }
    }

    function styleReading(reading) {
        return "<span style='color:" + getHex(reading) +
            " '> " + reading
            // + getStatus(reading)
            +
            "</span>";
    }
}); //end app