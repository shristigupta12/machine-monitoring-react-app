// src/utils/dataProcessor.js
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
        let changelog, predictionData, timeseriesDataRaw;

        // Dynamically select data based on machineId
        if (machineId === 'SSP0173') {
            changelog = changelogSSP0173;
            predictionData = predictionDataSSP0173;
            timeseriesDataRaw = {
                black: timeseriesBlackSSP0173,
                green: timeseriesGreenSSP0173,
                red: timeseriesRedSSP0173,
            };
        } else if (machineId === 'SSP0167') {
            changelog = changelogSSP0167;
            predictionData = predictionDataSSP0167;
            timeseriesDataRaw = {
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
        const uuidToLogIdMap = {}; // NEW: Map UUID from prediction_data to cycle_log_id for time series lookup

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

            const maxCycles = 1000;
            const cyclesToProcess = cycleKeys.slice(0, maxCycles);

            cyclesToProcess.forEach(cycleKey => {
                const cycleInfo = cycles[cycleKey];

                if (!cycleInfo || !cycleInfo.data) {
                    return;
                }

                const data = cycleInfo.data;
                const dataKeys = Object.keys(data); // sequence IDs

                // NEW: Populate the UUID to Log ID map
                if (cycleInfo.id && cycleInfo.cycle_log_id) {
                    uuidToLogIdMap[cycleInfo.id] = String(cycleInfo.cycle_log_id); // Ensure it's a string
                }

                dataKeys.forEach(sequenceId => {
                    const sequenceData = data[sequenceId];

                    if (!sequenceData || typeof sequenceData.distance !== 'number') {
                        return;
                    }

                    const distance = sequenceData.distance;
                    const isAnomaly = Boolean(sequenceData.anomaly);

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
        if (timeseriesDataRaw) {
            Object.entries(timeseriesDataRaw).forEach(([color, dataFile]) => {
                // IMPORTANT CHANGE: Access data under dataFile.Result.data
                if (dataFile && dataFile.Result && dataFile.Result.data) {
                    Object.entries(dataFile.Result.data).forEach(([cycleLogId, cycleSequences]) => { // Use cycleLogId as key
                        if (!detailedTimeSeries[cycleLogId]) {
                            detailedTimeSeries[cycleLogId] = {};
                        }
                        Object.entries(cycleSequences).forEach(([sequenceId, timeSeriesValues]) => {
                            const seriesData = Object.entries(timeSeriesValues).map(([time, value]) => ({
                                time: parseFloat(time),
                                value: parseFloat(value)
                            }));
                            if (!detailedTimeSeries[cycleLogId][sequenceId]) {
                                detailedTimeSeries[cycleLogId][sequenceId] = {};
                            }
                            detailedTimeSeries[cycleLogId][sequenceId][color] = seriesData;
                        });
                    });
                }
            });
        }

        console.log(`Processed ${processedData.length} scatter points and ${Object.keys(detailedTimeSeries).length} detailed time series cycles.`);

        return {
            scatterPoints: processedData,
            anomalies: anomalies,
            thresholds: thresholds,
            detailedTimeSeries: detailedTimeSeries, 
            uuidToLogIdMap: uuidToLogIdMap,      
        };
    } catch (error) {
        console.error('Error in processMachineData:', error);
        return {
            scatterPoints: [],
            anomalies: {},
            thresholds: {},
            detailedTimeSeries: {},
            uuidToLogIdMap: {},
        };
    }
};