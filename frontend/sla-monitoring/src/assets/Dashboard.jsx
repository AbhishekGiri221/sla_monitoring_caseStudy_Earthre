import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://leszkwm423.execute-api.eu-north-1.amazonaws.com";

function Dashboard() {
    const [file, setFile] = useState(null);
    const [showStats, setShowStats] = useState(true);

    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [uploading, setUploading] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);


    // Fetch statistics
    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/stats`);
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // -----------------------------
    // Fetch logs
    // -----------------------------
    const fetchLogs = async () => {
        try {
            setLoadingLogs(true);

            const params = {};

            if (startDate) {
                params.startDate = startDate;
            }

            if (endDate) {
                params.endDate = endDate;
            }

            const response = await axios.get(`${API_URL}/logs`, {
                params
            });

            setLogs(response.data);

        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoadingLogs(false);
        }
    };

    // -----------------------------
    // Initial dashboard load
    // -----------------------------
    useEffect(() => {
        fetchStats();
        fetchLogs();
    }, []);

    // -----------------------------
    // Upload CSV
    // -----------------------------
    const handleUpload = async () => {
        if (!file) {
            alert("Please select a CSV file");
            return;
        }

        try {
            setUploading(true);

            const csvText = await file.text();

            const response = await axios.post(
                `${API_URL}/upload`,
                csvText,
                {
                    headers: {
                        "Content-Type": "text/csv"
                    }
                }
            );

            console.log(response.data);

            alert("CSV uploaded successfully");

            // Refresh dashboard data
            await fetchStats();
            await fetchLogs();

        } catch (error) {
            console.error("Upload error:", error);

            alert("Upload failed");

        } finally {
            setUploading(false);
        }
    };

    // -----------------------------
    // Date filter
    // -----------------------------
    const handleFilter = () => {
        fetchLogs();
    };

    // -----------------------------
    // Clear filter
    // -----------------------------
    const handleClearFilter = () => {
        setStartDate("");
        setEndDate("");

        // Fetch all logs again
        setTimeout(() => {
            fetchLogs();
        }, 0);
    };

    return (
        <div style={{ padding: "30px" }}>

            <h1>SLA Monitoring Dashboard</h1>

            {/* ========================= */}
            {/* UPLOAD */}
            {/* ========================= */}

            <section>
                <h2>Upload CSV</h2>

                <input
                    type="file"
                    accept=".csv"
                    onChange={(event) => {
                        setFile(event.target.files[0]);
                    }}
                />

                <button
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? "Uploading..." : "Upload"}
                </button>
            </section>


            {/* ========================= */}
            {/* STATS */}
            {/* ========================= */}

            <section style={{ marginTop: "30px" }}>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <h2>Statistics</h2>

                    <button
                        onClick={() => setShowStats(!showStats)}
                    >
                        {showStats ? "Hide Stats" : "Show Stats"}
                    </button>
                </div>

                {showStats && stats && (

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(3, 1fr)",
                            gap: "15px"
                        }}
                    >

                        <div>
                            <h3>Total Checks</h3>
                            <p>{stats.totalChecks}</p>
                        </div>

                        <div>
                            <h3>Services</h3>
                            <p>{stats.totalServices}</p>
                        </div>

                        <div>
                            <h3>Availability</h3>
                            <p>{stats.availability}%</p>
                        </div>

                        <div>
                            <h3>Successful Checks</h3>
                            <p>{stats.successfulChecks}</p>
                        </div>

                        <div>
                            <h3>Failed Checks</h3>
                            <p>{stats.failedChecks}</p>
                        </div>

                        <div>
                            <h3>Average Latency</h3>
                            <p>{stats.averageLatency} ms</p>
                        </div>

                        <div>
                            <h3>P95 Latency</h3>
                            <p>{stats.p95Latency} ms</p>
                        </div>

                    </div>
                )}

            </section>


            {/* ========================= */}
            {/* LOGS */}
            {/* ========================= */}

            <section style={{ marginTop: "30px" }}>

                <h2>Health Check Logs</h2>

                <div>

                    <label>
                        Start Date:
                    </label>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(event) =>
                            setStartDate(event.target.value)
                        }
                    />

                    <label style={{ marginLeft: "15px" }}>
                        End Date:
                    </label>

                    <input
                        type="date"
                        value={endDate}
                        onChange={(event) =>
                            setEndDate(event.target.value)
                        }
                    />

                    <button
                        onClick={handleFilter}
                        style={{ marginLeft: "15px" }}
                    >
                        Filter
                    </button>

                    <button
                        onClick={handleClearFilter}
                        style={{ marginLeft: "10px" }}
                    >
                        Clear
                    </button>

                </div>


                {loadingLogs ? (
                    <p>Loading logs...</p>
                ) : (

                    <table
                        border="1"
                        cellPadding="8"
                        style={{
                            marginTop: "20px",
                            width: "100%",
                            borderCollapse: "collapse"
                        }}
                    >

                        <thead>

                            <tr>
                                <th>Timestamp</th>
                                <th>Service</th>
                                <th>Status</th>
                                <th>Latency</th>
                                <th>Agent</th>
                                <th>Region</th>
                            </tr>

                        </thead>

                        <tbody>

                            {logs.map((log, index) => (

                                <tr key={index}>

                                    <td>
                                        {new Date(
                                            log.timestamp
                                        ).toLocaleString()}
                                    </td>

                                    <td>
                                        {log.service_name}
                                    </td>

                                    <td>
                                        {log.status_code}
                                    </td>

                                    <td>
                                        {log.latency_ms !== null
                                            ? `${log.latency_ms} ms`
                                            : "N/A"}
                                    </td>

                                    <td>
                                        {log.agent}
                                    </td>

                                    <td>
                                        {log.region}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>
                )}

            </section>

        </div>
    );
}

export default Dashboard;
