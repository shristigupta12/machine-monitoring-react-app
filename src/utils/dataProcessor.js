import changelogSSP0173 from '../data/Machine1-SSP0173/changelog.json';
import predictionDataSSP0173 from '../data/Machine1-SSP0173/prediction_data.json';
import timeseriesBlackSSP0173 from '../data/Machine1-SSP0173/timeseries_cycledata_black.json';
import timeseriesGreenSSP0173 from '../data/Machine1-SSP0173/timeseries_cycledata_green.json';
import timeseriesRedSSP0173 from '../data/Machine1-SSP0173/timeseries_cycledata_red.json';
import changelogSSP0167 from '../data/Machine2-SSP0167/changelog.json';
import predictionDataSSP0167 from '../data/Machine2-SSP0167/prediction_data.json';
import timeseriesBlackSSP0167 from '../data/Machine2-SSP0167/timeseries_cycledata_black.json';
import timeseriesGreenSSP0167 from '../data/Machine2-SSP0167/timeseries_cycledata_green.json';
import timeseriesRedSSP0167 from '../data/Machine2-SSP0167/timeseries_cycledata_red.json';

export const processMachineData = (machineId) => {
    try {
        let changelog, predictionData, timeseriesData;

        if (machineId === 'SSP0173') {
            changelog = changelogSSP0173;
            predictionData = predictionDataSSP0173;
            timeseriesData = {
              black: timeseriesBlackSSP0173,
              green: timeseriesGreenSSP0173,
              red: timeseriesRedSSP0173,
            };
        } else if (machineId === 'SSP0167') {
            changelog = changelogSSP0167;
            predictionData = predictionDataSSP0167;
            timeseriesData = {
                black: timeseriesBlackSSP0167,
                green: timeseriesGreenSSP0167,
                red: timeseriesRedSSP0167,
            };
        }
        else {
            console.warn(`Data for machine ${machineId} not found.`);
            return null;
        }

        const processedData = []; // For scatter plot
        const anomalies = {};     // For anomaly summary
        const thresholds = {};    // For min/max thresholds
        const detailedTimeSeries = {}; // To store detailed time series data per cycle and sequence


        // 1. Extract Anomaly Thresholds from changelog
        if (changelog && changelog.Result && changelog.Result.length > 0) {
            const configParams = changelog.Result[0].config_parameters;
            if (configParams && configParams.sequence) {
                Object.keys(configParams.sequence).forEach(sequenceId => {
                    thresholds[sequenceId] = {
                        min: configParams.sequence[sequenceId].min_points,
                        max: configParams.sequence[sequenceId].max_points,
                    };
                });
            }
        }

        // 2. Process Prediction Data for Cycles and Anomalies
        if (predictionData && predictionData.Result && predictionData.Result.cycles) {
            const cycles = predictionData.Result.cycles;
            const cycleKeys = Object.keys(cycles);

            const maxCycles = 1000; // Limit for scatter plot points, adjust as needed
            const cyclesToProcess = cycleKeys.slice(0, maxCycles); // Apply limit for initial scatter

            cyclesToProcess.forEach(cycleKey => {
                const cycleInfo = cycles[cycleKey];

                if (!cycleInfo || !cycleInfo.data) {
                    return; // Skip invalid cycles
                }

                const data = cycleInfo.data;
                const dataKeys = Object.keys(data); // sequence IDs

                dataKeys.forEach(sequenceId => {
                    const sequenceData = data[sequenceId];

                    if (!sequenceData || typeof sequenceData.distance !== 'number') {
                        return; // Skip invalid sequence data
                    }

                    const distance = sequenceData.distance;
                    const isAnomaly = Boolean(sequenceData.anomaly);

                    // If anomaly, add to anomalies object
                    if (isAnomaly) {
                        if (!anomalies[cycleInfo.id]) {
                            anomalies[cycleInfo.id] = {
                                startTime: cycleInfo.start_time,
                                machineId: cycleInfo.machine_id,
                                sequences: {}
                            };
                        }
                        anomalies[cycleInfo.id].sequences[sequenceId] = {
                            distance: distance,
                            anomalyType: isAnomaly
                        };
                    }

                    // Add to processedData for charting (scatter points)
                    processedData.push({
                        id: cycleInfo.id,
                        sequence: sequenceId,
                        time: new Date(cycleInfo.start_time).getTime(), 
                        distance: distance,
                        isAnomaly: isAnomaly,
                        minThreshold: thresholds[sequenceId] ? thresholds[sequenceId].min : null,
                        maxThreshold: thresholds[sequenceId] ? thresholds[sequenceId].max : null,
                    });
                });
            });
        }

        // 3. Process Detailed Time-Series Data
        // Iterate through each color (black, green, red) and then by cycle ID
        if (timeseriesData) {
            Object.entries(timeseriesData).forEach(([color, dataFile]) => {
                if (dataFile && dataFile.Result) {
                    Object.entries(dataFile.Result).forEach(([cycleId, cycleSequences]) => {
                        if (!detailedTimeSeries[cycleId]) {
                            detailedTimeSeries[cycleId] = {};
                        }
                        Object.entries(cycleSequences).forEach(([sequenceId, timeSeriesValues]) => {
                            // Convert timeSeriesValues (object with string keys) to an array of { time: number, value: number }
                            const seriesData = Object.entries(timeSeriesValues).map(([time, value]) => ({
                                time: parseFloat(time), // Convert string time to number
                                value: parseFloat(value) // Convert string value to number
                            }));
                            if (!detailedTimeSeries[cycleId][sequenceId]) {
                                detailedTimeSeries[cycleId][sequenceId] = {};
                            }
                            detailedTimeSeries[cycleId][sequenceId][color] = seriesData;
                        });
                    });
                }
            });
        }

        console.log(`Processed ${processedData.length} data points`);
        
        return {
            scatterPoints: processedData,
            anomalies: anomalies,
            thresholds: thresholds,
            detailedTimeSeries: detailedTimeSeries,
        };
    } catch (error) {
        console.error('Error in processMachineData:', error);
        return {
            scatterPoints: [],
            anomalies: {},
            thresholds: {},
            detailedTimeSeries: {},
        };
    }
};