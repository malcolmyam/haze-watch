
    const PSI_URL = "https://api.data.gov.sg/v1/environment/psi";
    const PM25_URL = "https://api.data.gov.sg/v1/environment/pm25";
    let psiIndexCategory = [{
        psi: 0,
        pm25: 0,
        pm10: 0,
        so: 0,
        co: 0,
        o: 0,
        no: 0,
        status: "healthy",
        display: "Awesome",
        hex: "#06960F"
    },
    {
        psi: 50,
        pm25: 12,
        pm10: 50,
        so: 80,
        co: 5,
        o: 118,
        no: 0,
        status: "moderate",
        display: "Meh...",
        hex: "#076FA5"
    },
    {
        psi: 100,
        pm25: 55,
        pm10: 150,
        so: 365,
        co: 10,
        o: 157,
        no: 0,
        status: "unhealthy",
        display: "Little Yucky",
        hex: "#F8D200"
    },
    {
        psi: 200,
        pm25: 150,
        pm10: 350,
        so: 800,
        co: 17,
        o: 235,
        no: 1130,
        status: "very-unhealthy",
        display: "Very Yucky",
        hex: "#FFBF00",

    },
    {
        psi: 300,
        pm25: 250,
        pm10: 420,
        so: 1600,
        co: 34,
        o: 785,
        no: 2260,
        status: "hazardous",
        display: "Hazardously Terrible",
        hex: "#FFBF00"
    },
    {
        psi: 400,
        pm25: 350,
        pm10: 500,
        so: 2100,
        co: 46,
        o: 980,
        no: 3000,
        status: "hazardous",
        display: "Horrendously Terrible",
        hex: "#FF0000"
    },
    {
        psi: 500,
        pm25: 500,
        pm10: 600,
        so: 2620,
        co: 57.5,
        o: 1180,
        no: 3750,
        status: "Hazardous",
        display: "Why Bother. RUN!",
        hex: "#FF0000"
    }
];

    /*
     * Convert time to API timestamp mode
     */
    function timeConvert(givenDate = "") {
        var today = new Date(givenDate);
        if (today === "")
            today = new Date();

        var dd = padZero(today.getDate());
        var mm = padZero(today.getMonth() + 1);
        var yyyy = padZero(today.getFullYear());
        var hh = padZero(today.getHours());
        var min = padZero(today.getMinutes());
        var ss = padZero(today.getSeconds());

        return yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + min + ":" + ss + "+08:00";
    }

    /*
     * adapted from w3schools
     */
    function padZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

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

      /*
     * Calculate the Hourly PSI index based on the air pollution indexes
     * PM25 hourly is used here
     */
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
                //console.log("reading: " + reading + " category: " + category + "psi" + psi);
                return psi;
            }
        }
        return 0;
    }
    QUnit.test("Test whether timeconverts properly timeConvert('2019-09-28T00:00:00+08:00')", function (assert) {
        var result = timeConvert("2019-09-28T00:00:00+08:00");
        assert.equal(result, "2019-09-28T00:00:00+08:00", "timeConvert('2019-09-28T00:00:00+08:00') equals 2019-09-28T00:00:00+08:00");
    });
    QUnit.test("Test whether time converts properly given just a day with no time timeConvert('2019-09-28)", function (assert) {
        var result = timeConvert("2019-09-28");
        assert.equal(result, "2019-09-28T08:00:00+08:00", "timeConvert('2019-09-28T00:00:00+08:00') equals 2019-09-28T00:00:00+08:00");
    });

    QUnit.test("Test whether color coding of PSI works: basic getHex(1)", function (assert) {
        var result = getHex(1);
        assert.equal(result, "#06960F", "getHex(1) equals #06960F");
    });

    QUnit.test("Test whether color coding of PSI works getHex('300')", function (assert) {
        var result = getHex(300);
        assert.equal(result, "#FFBF00", "getHex(300) equals #FFBF00");
    });

    QUnit.test("Test whether color coding of PSI works getHex('301')", function (assert) {
        var result = getHex(301);
        assert.equal(result, "#FF0000", "getHex(301) equals #FF0000");
    });

    QUnit.test("Test calculation of 1hr PSI based on different indexes", function (assert) {
        var result = calEstimatedHourPSI(40,12,4,6,11,9);
        assert.equal(result, "83", "calEstimatedHourPSI(40,12,4,6,11,9) equals 83");
    });

    


    
