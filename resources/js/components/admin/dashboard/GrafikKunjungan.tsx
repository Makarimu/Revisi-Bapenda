import { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { getGrafikBulanan } from '../../../api/admin/dashboard';
import Loading from '../../common/Loading';

const GrafikKunjungan = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchGrafik = async () => {
      try {
        const res = await getGrafikBulanan();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrafik();
  }, []);

  const options: any = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#2563eb'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
      tooltip: { enabled: false }
    },
    yaxis: {
      min: 0,
      tickAmount: 4,
      labels: { formatter: (val) => Math.floor(val) }
    },
    grid: { borderColor: '#f3f4f6', strokeDashArray: 4 }
  };

  const series = [{
    name: 'Total Permohonan',
    data: data.length ? data : Array(12).fill(0)
  }];

  if (loading) return <div className="h-[300px] flex items-center justify-center"><Loading fullScreen={false} /></div>;

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default GrafikKunjungan;
