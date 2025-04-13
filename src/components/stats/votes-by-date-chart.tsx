"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"

interface VoteData {
  date: string
  positiveVotes: number
  negativeVotes: number
  totalVotes: number
}

interface VotesByDateChartProps {
  data: VoteData[]
}

export function VotesByDateChart({ data }: VotesByDateChartProps) {
  // Format de la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  // Formatteur personnalisé pour le tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="mb-2 font-medium">{formatDate(label)}</p>
          <p className="text-sm text-green-600">
            Votes positifs: {payload[0].value}
          </p>
          <p className="text-sm text-red-600">
            Votes négatifs: {payload[1].value}
          </p>
          <p className="text-sm text-gray-600">
            Total: {payload[2].value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des votes</CardTitle>
        <CardDescription>Nombre de votes par jour</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                minTickGap={30}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="positiveVotes" 
                name="Votes positifs"
                stroke="#10b981" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="negativeVotes" 
                name="Votes négatifs"
                stroke="#ef4444" 
              />
              <Line 
                type="monotone" 
                dataKey="totalVotes" 
                name="Total"
                stroke="#6b7280" 
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 