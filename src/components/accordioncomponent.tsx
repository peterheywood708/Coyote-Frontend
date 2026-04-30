import { Accordion, Badge, Button, Progress, Text } from "@mantine/core";
import { FaMusic, FaRegCalendar, FaRegTrashCan } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { Loader } from "@mantine/core";
import { useNavigate } from "react-router";
const config = await fetch("/config/config.json").then((res) => res.json());

type AccordianProps = {
  fileName: string;
  id: string;
  date: Date;
  token: string;
  status: number;
  percentageComplete: number;
};

const AccordionComponent = ({
  fileName,
  id,
  date,
  token,
  status,
  percentageComplete,
}: AccordianProps) => {
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [newPercentage, setNewPercentage] = useState(percentageComplete);
  const [newStatus, setNewStatus] = useState(status);

  const deleteJob = async (id: string) => {
    setLoading(true);
    try {
      await fetch(`${config.VITE_DB_ENDPOINT}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ id: id }),
      });
    } catch (err) {
      console.warn(err);
      setLoading(false);
      return;
    }
    setLoading(false);
    setHidden(true);
  };

  useEffect(() => {
    if (newStatus == 0 || newStatus == 1) {
      const interval = setInterval(async () => {
        try {
          const getJob = await fetch(`${config.VITE_DB_ENDPOINT}/getjob`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              id: id,
              Authorization: token || "",
            },
          });
          getJob.json().then(async (job) => {
            setNewPercentage(job?.percentageComplete);
            setNewStatus(job?.status);
          });
        } catch (err) {
          console.warn(err);
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [newStatus, newPercentage, setNewPercentage, setNewStatus, id, token]);

  return (
    <>
      {hidden ? null : (
        <Accordion.Item value={id}>
          <Accordion.Control>
            <h4>
              <FaMusic />
              &nbsp;&nbsp;&nbsp;
              {fileName.replace(".mp3", "").replace(".wav", "")}
            </h4>
            {newStatus == -1 ? <Badge color="red">Job failed</Badge> : null}
            {newStatus == 0 ? <Badge color="yellow">Pending</Badge> : null}
            {newStatus == 1 ? (
              <>
                <Text fz="xs" c="dimmed" mt={7}>
                  Progress: {newPercentage || 0}%
                </Text>
                <Progress value={newPercentage} mt={5} aria-label="Progress" />
              </>
            ) : null}
            {newStatus == 2 ? <Badge color="green">Completed</Badge> : null}
          </Accordion.Control>
          <Accordion.Panel ta="left">
            <FaRegCalendar /> &nbsp;Uploaded on{" "}
            {new Date(date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Accordion.Panel>
          <Accordion.Panel ta="left">
            {status == 2 || newStatus == 2 ? (
              <>
                <Button
                  variant="filled"
                  onClick={() => navigate(`/transcription?id=${id}`)}
                >
                  View transcription
                </Button>
                &nbsp;&nbsp;
              </>
            ) : null}
            <Button variant="filled" color="red" onClick={() => deleteJob(id)}>
              {loading ? (
                <Loader color="white" size="xs" />
              ) : (
                <>
                  <FaRegTrashCan />
                  &nbsp;&nbsp; Delete
                </>
              )}
            </Button>
          </Accordion.Panel>
        </Accordion.Item>
      )}
    </>
  );
};

export default AccordionComponent;
